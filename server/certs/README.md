# Supabase production root CA

`supabase-prod-ca-2021.crt` is a public certificate, not a private key or database credential. The migration connection adds it to Node's standard trust roots; an explicit `SUPABASE_DB_SSL_CA` overrides this default. Certificate and hostname verification remain enabled. Other application/provider connections keep their normal TLS settings.

Downloaded over verified HTTPS on 2026-11-01 from the same production download URL used by Supabase Studio:

- [Official certificate](https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt)
- [Studio certificate URL configuration](https://github.com/supabase/supabase/blob/a05e7ec1d79e67cba65e3871b7caf105db27f8b1/apps/studio/hooks/custom-content/custom-content.json)
- [Studio SSL configuration component](https://github.com/supabase/supabase/blob/a05e7ec1d79e67cba65e3871b7caf105db27f8b1/apps/studio/components/interfaces/Settings/Database/SSLConfiguration.tsx)
- [Supabase SSL documentation](https://supabase.com/docs/guides/platform/ssl-enforcement)

Subject: `Supabase Root 2021 CA`, issuer: same. Valid from 2021-04-28 to 2031-04-26.

SHA-256 certificate fingerprint:
`80:70:25:AD:50:D4:ED:21:9D:2C:9C:7D:29:9C:00:4F:82:4E:B0:0C:F7:F6:5A:FE:F6:07:D0:7B:72:E6:CA:FA`

When Supabase rotates its CA, obtain the replacement from the authenticated dashboard or its official documented distribution, review the certificate/fingerprint and update the bundle and regression test together. Do not automatically trust a certificate merely because a failing server sends it.
