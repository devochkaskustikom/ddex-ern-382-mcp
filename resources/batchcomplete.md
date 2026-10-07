# BatchComplete package rules

Not part of `NewReleaseMessage`, but required for standard package delivery.

## Rules

1. **Filled** - blank manifests are invalid practice
2. **Relative paths** in `URL` (e.g. `./4631…/4631….xml`)
3. **DeliveryType:** `NewReleaseDelivery` | `ReDelivery` | `TakeDown`
4. **MD5** of the referenced message file (`HashSum` + `HashSumAlgorithmType=MD5`)
5. Upload **BatchComplete last**
6. FTP **binary** mode (text mode can rewrite CRLF and break hashes)

## MessageInBatch skeleton

```xml
<MessageInBatch>
  <MessageType>NewReleaseMessage</MessageType>
  <MessageId>…</MessageId>
  <URL>./ICPN/ICPN.xml</URL>
  <IncludedReleaseId>
    <ICPN>…</ICPN>
  </IncludedReleaseId>
  <DeliveryType>NewReleaseDelivery</DeliveryType>
  <ProductType>AudioProduct</ProductType>
  <HashSum>
    <HashSum>…md5…</HashSum>
    <HashSumAlgorithmType>MD5</HashSumAlgorithmType>
  </HashSum>
</MessageInBatch>
```
