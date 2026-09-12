# Follow-Up Schema & Code Tasks (Phase 8)

See full documentation at [docs/other/follow-up-schema-cleanups.md](file:///c:/projects/webdevshiz/auj-store/docs/other/follow-up-schema-cleanups.md).

### Summary Checklist:
- [x] Rename `products.stock_threshhold` -> `stock_threshold` (Migration + UI forms + Table columns).
- [x] Standardize `orders.partial_payment` nullability across DB and TypeScript models.
- [x] Standardize UUID nullability on `PrintJob.id` / `order_id`.
- [x] Update `print_job` DELETE policy target role from `PUBLIC` to `authenticated`.
- [x] Add RLS SELECT / UPDATE policies on `service_rates`.
