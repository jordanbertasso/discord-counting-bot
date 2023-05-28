import { describe, expect, test } from "@jest/globals";
import { parseNumber } from "./util";

describe("util.ts", () => {

  test("parseNumber()", () => {
    expect(parseNumber(null)).toBeNaN();
    expect(parseNumber("10")).toBe(10);
    expect(parseNumber("010")).toBe(0o10);
    expect(parseNumber("0x10")).toBe(0x10);
    expect(parseNumber("0b10")).toBe(0b10);
    expect(parseNumber("0o10")).toBe(0o10);
    expect(parseNumber("00000010")).toBe(0o10);
    expect(parseNumber("15.0")).toBe(15);
    expect(parseNumber("15.2")).toBe(15.2);
    expect(parseNumber("1500")).toBe(1500);
    expect(parseNumber("abc")).toBeNaN();
    expect(parseNumber("there are 10 ppl")).toBeNaN();
    expect(parseNumber("0000010 dollars")).toBeNaN();
  });

});
