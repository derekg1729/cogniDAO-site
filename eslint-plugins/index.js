/**
 * Custom ESLint rules for portability
 */

"use strict";

module.exports = {
  rules: {
    "no-edge-runtime": require("./rules/no-edge-runtime")
  }
}; 