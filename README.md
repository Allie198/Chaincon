
# ITU Blockchain Devs komitesi I. proje : Chaincon

**Bu bir devs komitesine adına yapılmış p2p çalışan bir blockchain projesidir**.

Projeyi kendi bilgisayarınızda çalıştırmak ve nodeları bağlamak için şunları yapın:

1.  **Projeyi İndirin**
    ```bash
    git clone [https://github.com/Allie198/Chaincon.git](https://github.com/Allie198/Chaincon.git)
    cd Chaincon
    ```

2.  **Gerekli Paketleri Yükleyin**
    Proje `ws` gibi soket kütüphaneleri kullandığı için NPM paketlerini yüklemelisiniz
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın**
    farklı terminaller açarak port numarasıyla başlatman lazım
    ```bash
    node index.js 6001
    node index.js 6002 6001
    ```

 ---

## kütüphaneler

### 1. Harici Kütüphane 

| Kütüphane Adı | görevi |
| :--- | :--- |
| **`ws`** | **peerlar arası iletişim** |
|**`crypto`** | **Kriptografik şifreleme** |

### 2. Node.js Çekirdek Modülleri (Sistem İşlemleri)

| Modül Adı | görevi |
| :--- | :---
| **`fs`** | **Veri Kalıcılığı** |
|**`events`**| **olay döngüsü haberleşmesi**|
|**`process`**|**terminal argümanlarını okuma**|


---

## dosyaların işleyişi

 Bu proje **blokzincir mantığını**, **madencilik (Proof of Work)**, **gossip protokolü** ve **cüzdan** işlemlerini barındırır

| dosya |  mantığı | görevi |
| :--- | :--- | :---
|**`transactions.js`**| işlem yükü| Transferin kimden kime gidiceğini ve imza kontrolünü yapar. paranın miktarını belirler.|
|**`block.js`**| kilitli veri kutusu | işlemleri içine alır ve prevHash ile öncekine bağlar. madencilik burda yapılır |
|**`blockchain.js`**|defter kordinatörü | Zincirin kopmamasını sağlar, blokları kontrol eder ve validasyon yapar.
|**`miner.js`** |kazı yapan işçi | bilgisayarın gücünü kullanarak hash bulmaya çalışır ve ödülü kapar.
|**`walletStore.js`**|cüzdan deposu |cüzdan dosyası yoksa yenisini oluşturur varsa eskini yükler.
|**`gossip.js`**|dedikodu ağı|node'ların birbirine bağlanmasını ve blokları birbirine haber vermesini sağlayan yapı.
|**`blockchain.json`**|kayıt dosyası|zincirin silinmemesi için verilerin tutulduğu json dosyası.
|**`index.js`**| başlatıcı| uygulamanın giriş noktasıdır, portları ve p2p ağını burdan başlatırız.

    ---


### Geliştiriciler

* **gloriaraiden**
* **Allie198**
