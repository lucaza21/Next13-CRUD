import { describe, it, expect } from "vitest";
import { escapeRegExp } from "@/libs/search";

describe("escapeRegExp", () => {
    it("no modifica un string sin caracteres especiales", () => {
        expect(escapeRegExp("hello")).toBe("hello");
    });

    it("escapa los signos +", () => {
        expect(escapeRegExp("C++")).toBe("C\\+\\+");
    });

    it("escapa una regex hostil para que se trate como texto literal", () => {
        const escaped = escapeRegExp("(a+)+$");
        const re = new RegExp(escaped, "i");
        expect(re.test("(a+)+$")).toBe(true);
        expect(re.test("aaaaaaaaaaaa")).toBe(false);
    });

    it("escapa el punto para que no matchee cualquier carácter", () => {
        expect(escapeRegExp("a.b")).toBe("a\\.b");
    });
});
