# Tersane Yönetim Sistemi - Veritabanı Yedekleme Stratejisi

## 1. Manuel Yedek Alma (Backup)
Sunucuya SSH ile bağlandıktan sonra, çalışan PostgreSQL konteynerinden dump (yedek) almak için:
```bash
docker exec -t shipyard_db pg_dump -U root -d shipyard_db -F c > /backup/shipyard_db_$(date +%F).dump

(Not: Canlı sunucuda bu komut Cron Job ile her gece 03:00'te otomatik çalışacak şekilde ayarlanmalıdır.)
2. Geri Yükleme (Restore)

Olası bir veri kaybında alınan yedeği sisteme geri yüklemek için:
Bash

# Önce veritabanına bağlanıp eski verileri temizle (Dikkatli kullanın!)
docker exec -it shipyard_db dropdb -U root shipyard_db
docker exec -it shipyard_db createdb -U root shipyard_db

# Yedeği (dump) geri yükle
docker exec -i shipyard_db pg_restore -U root -d shipyard_db < /backup/shipyard_db_2026-10-1