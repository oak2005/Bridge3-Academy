import { describe, it, expect } from "vitest";
import {
  buildTrackSequence,
  getNextStep,
  getPreviousStep,
  getItemUrl,
  TrackStructure,
} from "../courseSequence";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const fullTrack: TrackStructure = {
  id: "track-1",
  title: "General Track",
  modules: [
    {
      id: "mod-1",
      title: "Module 1",
      order_index: 1,
      lessons: [
        { id: "les-1-1", title: "Lesson 1.1", order_index: 1 },
        { id: "les-1-2", title: "Lesson 1.2", order_index: 2 },
        { id: "les-1-3", title: "Lesson 1.3", order_index: 3 },
      ],
      quiz: { id: "quiz-1", title: "Module 1 Quiz" },
      assignments: [
        { id: "assign-1-1", title: "Assignment 1.1", order_index: 1 },
      ],
    },
    {
      id: "mod-2",
      title: "Module 2",
      order_index: 2,
      lessons: [
        { id: "les-2-1", title: "Lesson 2.1", order_index: 1 },
        { id: "les-2-2", title: "Lesson 2.2", order_index: 2 },
      ],
      quiz: null,
      assignments: [
        { id: "assign-2-1", title: "Assignment 2.1", order_index: 1 },
        { id: "assign-2-2", title: "Assignment 2.2", order_index: 2 },
      ],
    },
  ],
};

const singleLessonTrack: TrackStructure = {
  id: "track-single",
  title: "Single Lesson Track",
  modules: [
    {
      id: "mod-s",
      title: "Only Module",
      order_index: 1,
      lessons: [{ id: "les-s-1", title: "The Only Lesson", order_index: 1 }],
      quiz: null,
      assignments: [],
    },
  ],
};

const emptyModuleTrack: TrackStructure = {
  id: "track-empty-mod",
  title: "Track With Empty Module",
  modules: [
    {
      id: "mod-empty",
      title: "Empty Module",
      order_index: 1,
      lessons: [],
      quiz: null,
      assignments: [],
    },
    {
      id: "mod-real",
      title: "Real Module",
      order_index: 2,
      lessons: [{ id: "les-r-1", title: "Real Lesson", order_index: 1 }],
      quiz: { id: "quiz-r", title: "Real Quiz" },
      assignments: [],
    },
  ],
};

const quizOnlyModuleTrack: TrackStructure = {
  id: "track-quiz-only",
  title: "Quiz Only Module",
  modules: [
    {
      id: "mod-q",
      title: "Quiz Module",
      order_index: 1,
      lessons: [{ id: "les-q-1", title: "Lesson before quiz", order_index: 1 }],
      quiz: { id: "quiz-q", title: "Module Quiz" },
      assignments: [],
    },
    {
      id: "mod-next",
      title: "Next Module",
      order_index: 2,
      lessons: [{ id: "les-n-1", title: "Next lesson", order_index: 1 }],
      quiz: null,
      assignments: [],
    },
  ],
};

const noLessonsButAssignment: TrackStructure = {
  id: "track-no-lessons",
  title: "No Lessons But Assignment",
  modules: [
    {
      id: "mod-nla",
      title: "Module with assignment only",
      order_index: 1,
      lessons: [],
      quiz: null,
      assignments: [{ id: "assign-nla", title: "Assignment", order_index: 1 }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("buildTrackSequence", () => {
  it("builds correct sequence for a full track", () => {
    const seq = buildTrackSequence(fullTrack);
    expect(seq.map((s) => s.id)).toEqual([
      "les-1-1", "les-1-2", "les-1-3", "quiz-1", "assign-1-1",
      "les-2-1", "les-2-2", "assign-2-1", "assign-2-2",
    ]);
  });

  it("skips empty modules", () => {
    const seq = buildTrackSequence(emptyModuleTrack);
    expect(seq.map((s) => s.id)).toEqual(["les-r-1", "quiz-r"]);
  });

  it("handles a single lesson track", () => {
    const seq = buildTrackSequence(singleLessonTrack);
    expect(seq).toHaveLength(1);
    expect(seq[0].id).toBe("les-s-1");
  });

  it("handles a module with no lessons but an assignment", () => {
    const seq = buildTrackSequence(noLessonsButAssignment);
    expect(seq).toHaveLength(1);
    expect(seq[0].type).toBe("assignment");
  });

  it("returns empty array for a track with no modules", () => {
    const seq = buildTrackSequence({ id: "t", title: "Empty", modules: [] });
    expect(seq).toEqual([]);
  });
});

describe("getNextStep", () => {
  const seq = buildTrackSequence(fullTrack);

  it("returns next lesson in the middle of a module", () => {
    const next = getNextStep(seq, "les-1-1");
    expect(next).not.toBe("track_finished");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("les-1-2");
      expect(next.type).toBe("lesson");
    }
  });

  it("returns quiz after last lesson when module has a quiz", () => {
    const next = getNextStep(seq, "les-1-3");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("quiz-1");
      expect(next.type).toBe("quiz");
    }
  });

  it("returns assignment after quiz", () => {
    const next = getNextStep(seq, "quiz-1");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("assign-1-1");
      expect(next.type).toBe("assignment");
    }
  });

  it("crosses module boundary correctly", () => {
    const next = getNextStep(seq, "assign-1-1");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("les-2-1");
      expect(next.type).toBe("lesson");
      expect(next.moduleId).toBe("mod-2");
    }
  });

  it("returns track_finished at the last item of the entire track", () => {
    const next = getNextStep(seq, "assign-2-2");
    expect(next).toBe("track_finished");
  });

  it("returns null when item is deleted (not found)", () => {
    const next = getNextStep(seq, "non-existent-id");
    expect(next).toBeNull();
  });

  it("returns null for empty sequence", () => {
    const next = getNextStep([], "les-1-1");
    expect(next).toBeNull();
  });

  it("returns track_finished for a single lesson track", () => {
    const singleSeq = buildTrackSequence(singleLessonTrack);
    const next = getNextStep(singleSeq, "les-s-1");
    expect(next).toBe("track_finished");
  });

  it("goes from last lesson to next module when no quiz and no assignment", () => {
    // Module 2 has no quiz: after les-2-2, next is assign-2-1
    const next = getNextStep(seq, "les-2-2");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("assign-2-1");
    }
  });

  it("handles quiz-only module followed by next module", () => {
    const qSeq = buildTrackSequence(quizOnlyModuleTrack);
    const next = getNextStep(qSeq, "quiz-q");
    expect(next).not.toBeNull();
    if (next && next !== "track_finished") {
      expect(next.id).toBe("les-n-1");
      expect(next.moduleId).toBe("mod-next");
    }
  });
});

describe("getPreviousStep", () => {
  const seq = buildTrackSequence(fullTrack);

  it("returns start_of_track at the first item", () => {
    const prev = getPreviousStep(seq, "les-1-1");
    expect(prev).toBe("start_of_track");
  });

  it("returns previous lesson in the middle", () => {
    const prev = getPreviousStep(seq, "les-1-2");
    expect(prev).not.toBeNull();
    if (prev && prev !== "start_of_track") {
      expect(prev.id).toBe("les-1-1");
    }
  });

  it("returns last lesson before quiz", () => {
    const prev = getPreviousStep(seq, "quiz-1");
    expect(prev).not.toBeNull();
    if (prev && prev !== "start_of_track") {
      expect(prev.id).toBe("les-1-3");
    }
  });

  it("crosses module boundary backwards", () => {
    const prev = getPreviousStep(seq, "les-2-1");
    expect(prev).not.toBeNull();
    if (prev && prev !== "start_of_track") {
      expect(prev.id).toBe("assign-1-1");
      expect(prev.moduleId).toBe("mod-1");
    }
  });

  it("returns null when item not found", () => {
    const prev = getPreviousStep(seq, "deleted-item");
    expect(prev).toBeNull();
  });
});

describe("getItemUrl", () => {
  it("returns correct URL for a lesson", () => {
    expect(getItemUrl({ type: "lesson", id: "abc", moduleId: "m1" })).toBe(
      "/dashboard/classroom/abc"
    );
  });

  it("returns correct URL for a quiz", () => {
    expect(getItemUrl({ type: "quiz", id: "q1", moduleId: "m1" })).toBe(
      "/dashboard/assessments/quiz/m1"
    );
  });

  it("returns correct URL for an assignment", () => {
    expect(getItemUrl({ type: "assignment", id: "a1", moduleId: "m1" })).toBe(
      "/dashboard/workshops/a1"
    );
  });
});
