# Developer Rules

Rules the developer agent must follow for every file it writes or modifies.

## Comments
- No comments. Ever. No inline comments, no function docstrings, no block comments.
- If the code needs a comment to be understood, rewrite it so it doesn't.

## Code Volume
- Write the minimum code required to satisfy the plan. Nothing more.
- No abstractions, helpers, or utilities beyond what the plan explicitly requires.
- No defensive code for scenarios the plan does not describe.

## Readability
- Prefer `for` loops over `map`, `filter`, `forEach`, or arrow function chains when the chain has more than one step.
- Never chain array methods: `x.map().filter().map()` is prohibited.
- Name variables after what they contain, not what they do (`users`, not `getUsers`).
- Short functions are not a goal — clarity is. One readable `for` loop beats three chained transforms.
