
# ITU Blockchain Devs komitesi I. proje : Chaincon


**Bu bir devs komitesine adına yapılmış bir blockchainin basit bir modülüdür**.


Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi İndirin**
    ```bash
    git clone [https://github.com/Allie198/Chaincon.git](https://github.com/Allie198/Chaincon.git)
    cd Chaincon
    ```

2.  **Gerekli Paketleri Yükleyin**
    Proje `inquirer` gibi harici kütüphaneler kullandığı için NPM paketlerini yüklemelisiniz
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın**
    ```bash
    node cli.js
    ```

  ---

## kütüphaneler

### 1. Harici Kütüphane (Kullanıcı Arayüzü)

| Kütüphane Adı | görevi |
| :--- | :--- | 
| **`inquirer`** | **İnteraktif CLI Arayüzü** | 
|**`ws(websocket)`** | **p2p iletişim** | 
|**`elliptic`** | **Kriptografik İmza**|

### 2. Node.js Çekirdek Modülleri (Sistem İşlemleri)



| Modül Adı | görevi | 
| :--- | :--- 
| **`crypto`** | **Kriptografik İşlemler** |
| **`fs` (File System)** | **Veri Kalıcılığı** | 
|**`events`**| **Kod içi haberleşme**|
|**`path`**|**dosya yolu düzenleyicisi**|


---

## dosyaların işleyişi

 Bu proje **blokzincir mantığını**, **madencilik (Proof of Work) mekanizmasını**, **işlem doğrulama süreçlerini** ve **hashleme** yöntemlerini barındırır

| dosya |  mantığı | görevi |
| :--- | :--- | :--- 
|**`transaction.js`**| Atomik işlem yükü| Transferin kimden kime yapılıcağını ve ne kadar yapılıcağını belirler.İçeriğin değiştirilip değiştirilmediğini kontrol eder.|
|**`block.js`**| değiştirelemez veri bütünü | Bir çok işlemi bir araya getirerek prevHashle bunları kilitler. Proof of Work için gerekli olan nonce burada çözülür |
|**`blockchain.js`**|dağıtık defter kordinatörü | Tüm blokların bağlı liste veri yapısında tutulmasını, şifre olarak doğrulayan ve durum yönetimini yapan ana kontrol dizini budur.
|**`miner.js`** |işlem onaylayıcısı ve çifre çözücü | hash değerini bulmak için donanım gücünü harayan asenkron yapıdır.
|**`wallet.js`**|anahtar yönetim arayüzü |public ve private anahtarlarını üretmeye yarayan ve public keyi base58 formatında adres üretimini sağlar
|**`gossip.js`**|peerlar arası veri dağıtım ağı|perelar arasında webSocket ile çift yönlü veri akışını sağlayan sistemdir.
|**`data.json`**|kaydedilmiş defter verisi|bellekteki zincir verisini json formatında dizileştirerek disk üzerine yazan veri kalıcılığını sağlayan yapı.
|**`test.js`**| uygulama terminali| chaincon'un terminal arayüzünü oluşturan kısımdır