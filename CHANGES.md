# Changes

## Bug-fix pass 5 (third audit: stock, Excel, login, reminders, sync between different app versions)
Stock
- Renaming a stock item left every bill / return / site batch that was still out under the OLD name. A later
  return then created a fresh stock row with total 0 and the real figures were lost. The name is now changed
  everywhere (bills, returns, missing-item logs, site batches).
- The same product name could exist in Main AND Sub stock (dispatch/return forms mixed the two up). Refused when
  adding, renaming, and in Excel upload.
- Excel upload: negative numbers (total / in / out) are no longer accepted; choosing the same file twice now works.
- "Lost" charge for missing items: a negative amount is refused (it reduced the customer's fine).

Two PCs
- A product added on one PC and dispatched before syncing had its stock change counted TWICE after the merge.
- A product renamed on one PC while another PC still used the old name (records now follow the new name); the same
  new product added on both PCs (one row is kept); two different new products with the same internal id.
- A fine payment made offline was lost (kept in the payment log but not added to "paid") when the fine itself was
  also created offline.
- A database that arrives from a PC running an OLDER/newer app version (missing tables) no longer breaks screens.

Other
- Customers tab: a customer whose phone was typed as "+91 98765 43210", "098765 43210" or "9876543210" showed
  ₹0 outstanding / 0 rentals (phones were compared as raw text). Now compared by the last 10 digits.
- Return reminders kept ringing for items that were already written off as LOST.
- Bill numbers are escaped in the search lists / pop-ups / click handlers as well (defence in depth).

Verification
- Extra fuzz operations (missing-item restore/lost, fines, stock rename/add, Excel upload, closing sites): 110+
  random two-PC scenarios pass; the login system (setup, wrong password, 5-attempt lock, reset code, restart) is
  tested (9 checks); 19 new stock/merge checks.

## Bug-fix pass 4 (second audit: random-operation "fuzz" tests + two-PC merge tests)
Two PCs / sync (found by simulating two PCs working at the same time, 150 random scenarios, all now consistent)
- Two PCs creating a bill / return / site / attendance / salary / expense / income / maintenance / customer /
  employee at the same time could give DIFFERENT records the same number; one was silently dropped (sites were
  even glued onto the wrong customer). New records carry a unique `uid`; on a clash the newer one is renumbered and
  everything pointing to it (payments, returns, attendance/salary of a renumbered employee) is updated.
- Marking a missing site item as found/settled was lost when the server's copy won a merge, while the stock change
  was still applied (item shown missing but stock counted it back). Now kept; if BOTH PCs settled it, stock is
  added only once.

Forms / validation
- Advance can no longer be negative or larger than the bill total; rates cannot be negative (also enforced in the
  save function). Before, advance -500 raised the balance above the total and advance 99999 was counted as
  money collected. Same for return advance / additional payment.
- Same-day OUT/IN (and same-day return) is now accepted as a 1-day rental. It used to be refused, so a same-day
  return could not be recorded at all.
- Site OUT that asks for more than the available stock is refused (it used to record fewer pieces silently).
- Attendance: the same employee cannot be marked twice on one date (asks to replace). Salary: a second record for
  the same employee + month is refused (prevented paying a salary twice). Deleting an employee keeps their name on
  old attendance/salary rows.

Verification
- 66 scripted checks + a random-operation fuzz test (dispatch / partial return / payments / site out-in-missing /
  two-PC merge, invariants: stock equals the sum of records, no lost or duplicate records, balances never wrong).
  The ORIGINAL build fails that fuzz test in 24 of 25 runs; this build passes 150 of 150.

## Bug-fix pass 3 (audit of the whole app; each fix verified by an automated test)
Data safety
- A damaged / half-written / 0-byte data file is no longer overwritten with empty data. It is kept as
  `data\S_M_Centering_Data.CORRUPT_<time>.json` and the newest valid copy (`.tmp` file or `data\backups\*`)
  is restored automatically, with an on-screen notice.
- `saveDB()` now reports a failed disk write (it used to say "saved"). If the folder next to the .exe is
  read-only, data goes to `<home>\S_M_Centering\data` and the user is told.
- Only ONE copy of the app can run (two windows used to overwrite each other's data file).

Network sync
- Server read the request body without UTF-8 decoding: Tamil (3-byte) characters split across two network
  chunks became `���`. Fixed (`setEncoding('utf8')`).
- Conflict merge double-applied a payment to bills/returns that were new to the server (balance ended up too low).
- Site batches / payments / missing-item records are now matched on a unique `uid` (ids were "array length+1", so
  two PCs could drop each other's records); duplicate numeric ids are renumbered.
- Bill numbers skip numbers already used by another PC; a stale cached number no longer causes a permanent
  "Bill number already exists" loop.

Money / stock
- Dispatch: a bill whose quantity exceeds available stock, or with no items, is refused (it used to save with
  reduced quantities but the full total, or as an empty bill).
- 2nd/3rd partial return of a bill no longer gets the original advance credited again; the return form shows the
  advance still unused. Income + Dashboard now add up ALL returns of a bill (they used only the latest).
- Site payment / Place Order / Add OUT / Add IN / Mark Missing / Settle: double-click no longer records twice.
- Site "Sales Info" uses the monthly rate for monthly items.

Desktop (.exe) problems
- Payroll "Pay" used `prompt()`, which Electron does not support — the button did nothing. Now an in-app dialog
  (cannot pay more than the balance).
- WhatsApp numbers that start with 91 (valid mobiles like 9123456789) got the wrong country code.
- PDF: file names with `/ \ : * ? " < > |` no longer fail; the unsupported warning symbol is removed.
- Confirm dialog showed a literal `&amp;`.

Security / display
- Customer, phone, address, product names and search text are HTML-escaped everywhere they are shown
  (bill preview, search lists, alerts, refunds, settle dialog). With Node integration on, an unescaped
  name could run code.

Packaging
- Re-created `.github/workflows/build.yml` and `.gitignore` (the README described them but they were missing
  from the zip). Untested on GitHub itself.

## Known limits (unchanged / not fixable here)
- PDFs cannot print Tamil letters (built-in PDF font). Use English names on bills, or a Tamil font must be embedded.
- A refund owed to a customer cannot be marked "refunded" in the app (no such feature).
- With partial returns, a refund created by an early return is not automatically netted against the balance of a
  later return of the same bill.
- Two PCs that BOTH return/settle the very same bill at the same moment are recorded twice (a real conflict; nothing
  can decide which is right). Avoid working on the same bill from two PCs at once.
- Sync is still whole-database with server-wins for edits to existing non-financial records.
- Not tested on real Windows PCs / real Wi-Fi.

## Earlier passes (per SM_Centering_Complete_Claude_Requirements.md)

## Latest fix (this pass) — Dispatch/Return stock-corruption bug
- Small Construction **Return**: `apiAddReturn()` had NO server-side check on
  the item quantities it saved — unlike Dispatch (`apiAddOrder`, clamped to
  available stock) and Missing-Item settlement (`apiSettleMissingItems`,
  clamped to actual still-missing qty). A stale/typed-in qty could push a
  return past what was ever dispatched, silently inflating stock (`in_qty`)
  for that product forever.
- Compounding it: the Return screen's "Dispatched" auto-fill (`fillRet`)
  only subtracted qty from **earlier returns**, never qty already written
  off as **LOST** via the Missing Materials tab — so once an item was
  marked lost (fixed-charge), the Return tab still let staff "return"
  (and re-stock) that exact same lost quantity a second time.
- Fixed both: `apiAddReturn` now clamps every item to
  (dispatched − already returned across ALL prior returns of the bill −
  qty already resolved as LOST) before saving, the same "actual
  outstanding" math already used by `apiGetReturns`/`apiSettleMissingItems`;
  `fillRet` now also subtracts lost qty so the on-screen "Dispatched"
  figure and the input's max are correct too. This applies to the Small
  Construction dispatch/return flow; Site Ledger's own OUT/IN batches
  (`apiAddSiteOut`/`apiAddSiteIn`) were already correctly clamped via
  `computeSiteTotals`'s FIFO lot tracking and are unaffected.

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
