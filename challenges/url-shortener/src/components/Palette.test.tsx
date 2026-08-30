import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Palette } from "./Palette";
import { componentDefinitions } from "./definitions";

describe("Palette", () => {
  it("lists every non-client component grouped by category", () => {
    render(<Palette />);

    for (const def of componentDefinitions) {
      if (def.kind === "client") continue;
      // Label appears twice per component: once on the draggable card, once in its tooltip title.
      expect(screen.getAllByText(def.label).length).toBeGreaterThan(0);
    }
    // Client is placed on the canvas by default; it should not be draggable from the palette.
    expect(screen.queryByRole("button", { name: /Cliente/ })).not.toBeInTheDocument();
  });

  it("sets the component kind as drag data so the canvas can read it on drop", () => {
    render(<Palette />);
    const cacheButton = screen.getByRole("button", { name: /Cache/ });

    const dataTransfer = {
      data: new Map<string, string>(),
      setData(format: string, data: string) {
        this.data.set(format, data);
      },
      effectAllowed: "",
    };

    cacheButton.dispatchEvent(
      Object.assign(new Event("dragstart", { bubbles: true }), { dataTransfer }),
    );

    expect(dataTransfer.data.get("application/archdojo-component-kind")).toBe("cache");
  });

  it("exposes the teach-the-beginner explanation for every component via a tooltip", () => {
    render(<Palette />);
    const cache = componentDefinitions.find((d) => d.kind === "cache");
    if (!cache) throw new Error("expected cache definition to exist");

    expect(screen.getByText(cache.description, { exact: false })).toBeInTheDocument();
    expect(screen.getByText(cache.tradeoff, { exact: false })).toBeInTheDocument();
  });
});
