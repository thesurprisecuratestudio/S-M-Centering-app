# Changes (per SM_Centering_Complete_Claude_Requirements.md)

## Done
- Pending > Dispatch Pending: NO "Settle Now". Card is info-only (bill no, customer, mobile, address, items+qty, dispatch date/time, expected return, period, total/advance/balance, status). Click opens the bill.
- Pending > Return Balance Due: full info (items, dispatch/return date, rental calc, advance, paid, balance, status) + "Settle Now" only when balance > 0.
- Missing tab: shows ONLY items genuinely missing after a return + unpaid missing-item fine. Normal return balance is no longer shown/settled here.
- Missing fine is a separate amount (return.missing_fine / missing_fine_paid / missing_log). Own "Settle Missing Fine" action, own Dashboard card, Pending stat, Report tab, Excel columns. Never added to rental balance or Outstanding total.
- Lost items no longer counted as "returned"; restored items add stock once only; history kept in missing_log.
- Settlement: overpay rejected, double-click/duplicate blocked (unique settle id), payment log, return settlement now counted in income "collected".
- Login: OFF by default. Profile > Security to enable/disable. Credentials moved out of the synced DB into device-local file data\S_M_Centering_Auth.json (PBKDF2 hash, lockout after 5 wrong tries, min 6 chars). Sync/backup/restore never touch it. Old DB.auth is migrated (kept, but login OFF) and purged from DB.
- Network sync: server binds 0.0.0.0; client accepts several server IPs (Wi-Fi + Ethernet), probes in parallel, sticky, timeouts, backoff retry, re-tries on network change; no more full-DB push every 3s (push only when changed, pull only when server version changed); server version never 0 (fresh client can't overwrite server); credentials stripped from payloads; settlements/missing-log/return-closes-bill re-applied on conflict merge; status shows Synced / Pending / Offline / Syncing / Error + pending count.
- Backup: atomic file writes, validation, safety copy before restore, manual copy + daily auto backup in data\backups (last 14 kept).
- Audit log (Reports > Activity Log), duplicate bill-number check, mobile-number validation, duplicate customer phone check, main.js navigation lock.

## NOT done / known limits (please test on real PCs)
- Not tested on real Windows machines with Wi-Fi+Ethernet; tested only by loopback simulation + logic tests.
- Sync is still whole-database with server-wins for edits to EXISTING non-financial records; deletions can be resurrected by a merge (no tombstones yet). Two offline PCs generating the same bill number: one is dropped by merge (renumbering not implemented).
- No role-based access (single admin model), no PDF/CSV export for reports (Excel export exists), no per-record updated_at/version metadata, stock-movement log not added.
- Old missing charges already merged into final_balance stay there (can't be separated retroactively).
- XSS: escaped on Pending/Missing screens only; other screens not fully swept.
