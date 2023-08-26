import Foundation
import CryptoKit
import CommonCrypto

func fail(code: Int, message: String? = nil) {
  fail(code: Int32(code), message: message)
}

func fail(code: Int32, message: String? = nil) {
  let errorMessage: String = message != nil ? message! : "Failed unnexpectedly"
  if let errorData = errorMessage.data(using: .utf8) {
    FileHandle.standardError.write(errorData)
  }

  exit(code)
}

func generateSHA256Hash(from string: String) -> String {
    let inputData = Data(string.utf8)
    return generateSHA256Hash(from: inputData)
}

func generateSHA256Hash(from data: Data) -> String {
  var hash = [UInt8](repeating: 0, count: Int(CC_SHA256_DIGEST_LENGTH))
  data.withUnsafeBytes { (buffer: UnsafeRawBufferPointer) -> Void in
    _ = CC_SHA256(buffer.baseAddress, CC_LONG(buffer.count), &hash)
  }
    
  return hash.map { String(format: "%02x", $0) }.joined()
}
