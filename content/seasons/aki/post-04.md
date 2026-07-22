# Why drop caps still earn their pixels

Drop caps look ornamental until you watch someone start reading. The first letter larger, sitting in the margin, pulls the eye down into the paragraph instead of letting it skim the heading and bounce. On long technical essays, that half-second pause matters. It says "we're in the body now, not the pitch."

Implementation details are simple on purpose. One class on the first paragraph. A float or initial-letter rule depending on browser support. Aki ships the opinionated version so you don't debate it on day one. Strip it later if you're writing API docs. Keep it if you're writing anything you'd read on a Sunday.

Typography isn't neutral. Sans everywhere feels like a dashboard. Serif display plus sans body feels like a magazine that respects engineers. I picked fonts that load from Google with preconnect hints already in the shell. Performance and aesthetics share a budget.

Fall is a good season for editing. Cut the fourth paragraph you added because you felt insecure. Let the third paragraph carry the weight. Publish when the chapter ends, not when the word count hits a target. The theme will make it look considered either way. Your job is to make it true.
