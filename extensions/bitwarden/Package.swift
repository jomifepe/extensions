// swift-tools-version: 5.8
import PackageDescription

let package = Package(
    name: "BitwardenVaultNativeUtils",
    products: [
        .executable(
            name: "bw-native-utils",
            targets: ["BitwardenVaultNativeUtils"]),
    ],
    dependencies: [
        .package(url: "https://github.com/apple/swift-argument-parser.git", .upToNextMajor(from: "1.0.0")),
    ],
    targets: [
        // Targets are the basic building blocks of a package. A target can define a module or a test suite.
        // Targets can depend on other targets in this package, and on products in packages this package depends on.
        .executableTarget(
            name: "BitwardenVaultNativeUtils",
            dependencies: [
                .product(name: "ArgumentParser", package: "swift-argument-parser")
            ]),
    ]
)
