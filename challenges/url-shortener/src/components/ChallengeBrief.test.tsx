import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { urlShortenerChallenge } from "../challenge";
import { ChallengeBrief } from "./ChallengeBrief";

describe("ChallengeBrief", () => {
  it("renders the challenge title, functional and non-functional requirements", () => {
    render(<ChallengeBrief />);

    expect(screen.getByText(new RegExp(urlShortenerChallenge.title))).toBeInTheDocument();
    for (const req of urlShortenerChallenge.functionalRequirements) {
      expect(screen.getByText(req)).toBeInTheDocument();
    }
    for (const req of urlShortenerChallenge.nonFunctionalRequirements) {
      expect(screen.getByText(req.label)).toBeInTheDocument();
    }
  });
});
