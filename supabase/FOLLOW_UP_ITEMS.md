# Follow-Up Schema & Code Tasks (Phase 8)

See full documentation at [docs/other/follow-up-schema-cleanups.md](file:///c:/projects/webdevshiz/auj-store/docs/other/follow-up-schema-cleanups.md).

### Summary Checklist:
- [ ] Rename `products.stock_threshhold` -> `stock_threshold` (Migration + UI forms + Table columns).
- [ ] Standardize `orders.partial_payment` nullability across DB and TypeScript models.
- [ ] Standardize UUID nullability on `PrintJob.id` / `order_id`.
- [ ] Update `print_job` DELETE policy target role from `PUBLIC` to `authenticated`.
- [ ] Add RLS SELECT / UPDATE policies on `service_rates`.
