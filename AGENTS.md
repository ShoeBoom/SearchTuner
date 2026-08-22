# What we cant compromise on
- migrations/changes should work for both new users and for existing users.
- For re-ranking, sorting should be fast and not degrade user search experience vs without extension.
The latency of the results being hidden should be minimal. If the algorithm takes too long, vivo fallback to unhired content after a certain amount of time
- The algorithm for finding elements and ranking them should be very simple and have low amount of error scenarios. Reject features if they compromise it
