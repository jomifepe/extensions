import Foundation
import LocalAuthentication

func authenticateBiometric() {
  let context = LAContext()
  let group = DispatchGroup()
  let semaphore = DispatchSemaphore(value: 0)

  group.enter()

  // trigger fingerprint authentication
  context.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, localizedReason: "unlock your vault in Raycast") { success, error in
    if success {
      if let policyDomainState = context.evaluatedPolicyDomainState {
        let fingerprintDataHash = generateSHA256Hash(from: policyDomainState)
        print(fingerprintDataHash)
      } else {
        fail(code: 1, message: "No fingerprint data returned.")
      }
    } else {
      if error != nil {
        if let errorCode = (error as? NSError)?.code {
          fail(code: errorCode, message: error?.localizedDescription)
        } else {
          fail(code: 1, message: error?.localizedDescription)
        }
      } else {
        fail(code: 1)
      }
      
    }
    
    semaphore.signal()
    group.leave()
  }

  // wait for the authentication process to complete
  _ = semaphore.wait(timeout: DispatchTime.distantFuture)
  exit(0)
}
