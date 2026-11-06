module.exports = {
  "env": {
      "browser": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "project": "tsconfig.json",
      "sourceType": "module"
  },
  "plugins": [
      "@typescript-eslint"
  ],
  "root": true,
  "rules": {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-shadow": [ 
          "off",
          {
              "hoist": "all"
          }
      ],
      "@typescript-eslint/no-unused-expressions": "error", 
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-use-before-define": "off", 
      "@typescript-eslint/prefer-namespace-keyword": "error",
      "@typescript-eslint/typedef": "off", 
      "@typescript-eslint/comma-dangle": "off",
      "@typescript-eslint/no-redeclare": "error",
      "comma-dangle": "off", 
      "guard-for-in": "off", 
      "no-caller": "off", 
      "no-console": "off", 
      "no-eval": "off", 
      "no-extra-semi": "error",   
      "no-fallthrough": "off", 
      "no-new-wrappers": "off", 
      "no-redeclare": "error", 
      "no-shadow": "off", 
      "no-unused-expressions": "off", 
      "no-unused-labels": "off", 
      "no-use-before-define": "off", 
      "no-with": "error", 
      "semi": "off", 
      "func-style": [ 
          "error", 
          "declaration", { 
              "allowArrowFunctions": true 
          }
      ]
  }
};