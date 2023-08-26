import ArgumentParser
import Foundation

@main
struct BitwardenVaultNativeUtils: ParsableCommand {
  static let configuration = CommandConfiguration(
    commandName: "bw-native-utils",
    abstract: "Native utilities for the Bitwarden Vault Raycast extension.",
    subcommands: [
      Biometric.self,
    ]
  )
}

extension BitwardenVaultNativeUtils {
  struct Biometric: ParsableCommand {
    static let configuration = CommandConfiguration(abstract: "Prompt the user for biometric authentication.")
      
    mutating func run() {
      authenticateBiometric()
    }
  }
}


