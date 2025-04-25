import ExpoModulesCore
import UIKit
import CoreImage
import CoreImage.CIFilterBuiltins
import MapKit
import os.log

public class ExpoImageModifierModule: Module {
  private var isDebugMode = false
  private let logger = Logger(subsystem: "com.expo.imagemodifier", category: "ExpoImageModifier")

  public func definition() -> ModuleDefinition {
    Name("ExpoImageModifier")

    Function("setDebugMode") { (enabled: Bool) in
      isDebugMode = enabled
      if isDebugMode {
        logger.debug("Debug mode enabled")
      }
    }

    AsyncFunction("modifyImage") { (options: [String: Any]) -> [String: Any] in
      if isDebugMode {
        logger.debug("Starting image modification with options: \(options)")
      }

      guard let source = options["source"] as? [String: Any],
            let image = try await loadImage(from: source) else {
        if isDebugMode {
          logger.error("Invalid source provided")
        }
        throw ImageModifierError.invalidSource
      }

      if isDebugMode {
        logger.debug("Source image loaded: \(image.size.width)x\(image.size.height)")
      }

      var modifiedImage = image
      
      if let overlays = options["overlays"] as? [String: Any] {
        // Apply text overlays
        if let textOverlays = overlays["text"] as? [[String: Any]] {
          if isDebugMode {
            logger.debug("Applying \(textOverlays.count) text overlays")
          }
          for textOverlay in textOverlays {
            modifiedImage = try await applyTextOverlay(textOverlay, to: modifiedImage)
          }
        }
        
        // Apply image overlays
        if let imageOverlays = overlays["images"] as? [[String: Any]] {
          if isDebugMode {
            logger.debug("Applying \(imageOverlays.count) image overlays")
          }
          for imageOverlay in imageOverlays {
            modifiedImage = try await applyImageOverlay(imageOverlay, to: modifiedImage)
          }
        }

        // Apply map overlays
        if let mapOverlays = overlays["maps"] as? [[String: Any]] {
          if isDebugMode {
            logger.debug("Applying \(mapOverlays.count) map overlays")
          }
          for mapOverlay in mapOverlays {
            modifiedImage = try await applyMapOverlay(mapOverlay, to: modifiedImage)
          }
        }
      }

      let outputFormat = options["outputFormat"] as? String ?? "jpeg"
      let quality = options["quality"] as? Double ?? 0.92
      
      if isDebugMode {
        logger.debug("Saving image with format: \(outputFormat), quality: \(quality)")
      }
      
      return try await saveImage(modifiedImage, format: outputFormat, quality: quality)
    }

    AsyncFunction("loadImage") { (source: [String: Any]) -> [String: Any] in
      if isDebugMode {
        logger.debug("Loading image from source: \(source)")
      }
      
      guard let image = try await loadImage(from: source) else {
        if isDebugMode {
          logger.error("Failed to load image from source")
        }
        throw ImageModifierError.invalidSource
      }
      
      if isDebugMode {
        logger.debug("Image loaded successfully: \(image.size.width)x\(image.size.height)")
      }
      
      return [
        "uri": source["uri"] as? String ?? "",
        "width": image.size.width,
        "height": image.size.height
      ]
    }
  }

  private func loadImage(from source: [String: Any]) async throws -> UIImage? {
    if let uri = source["uri"] as? String,
       let url = URL(string: uri) {
      if isDebugMode {
        logger.debug("Loading image from URL: \(url)")
      }
      let (data, _) = try await URLSession.shared.data(from: url)
      return UIImage(data: data)
    } else if let base64 = source["base64"] as? String,
              let data = Data(base64Encoded: base64) {
      if isDebugMode {
        logger.debug("Loading image from base64 string")
      }
      return UIImage(data: data)
    } else if let localPath = source["localPath"] as? String {
      if isDebugMode {
        logger.debug("Loading image from local path: \(localPath)")
      }
      return UIImage(contentsOfFile: localPath)
    }
    return nil
  }

  private func applyTextOverlay(_ overlay: [String: Any], to image: UIImage) async throws -> UIImage {
    if isDebugMode {
      logger.debug("Applying text overlay: \(overlay)")
    }
    let text = overlay["text"] as? String ?? ""
    let position = overlay["position"] as? [String: Double] ?? [:]
    let style = overlay["style"] as? [String: Any] ?? [:]
    
    let x = position["x"] ?? 0
    let y = position["y"] ?? 0
    let fontSize = style["fontSize"] as? Double ?? 16
    let color = UIColor(hex: style["color"] as? String ?? "#000000")
    let fontName = style["fontFamily"] as? String ?? "Helvetica"
    let backgroundColor = style["backgroundColor"] as? String != nil ? UIColor(hex: style["backgroundColor"] as! String) : nil
    let opacity = style["opacity"] as? Double ?? 1.0

    UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
    image.draw(at: .zero)

    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.alignment = .left

    let font = UIFont(name: fontName, size: CGFloat(fontSize)) ?? UIFont.systemFont(ofSize: CGFloat(fontSize))
    let attributes: [NSAttributedString.Key: Any] = [
      .font: font,
      .foregroundColor: color.withAlphaComponent(CGFloat(opacity)),
      .paragraphStyle: paragraphStyle
    ]

    let textSize = (text as NSString).size(withAttributes: attributes)
    
    if let bgColor = backgroundColor {
      let rect = CGRect(x: x, y: y - textSize.height, width: textSize.width, height: textSize.height)
      bgColor.setFill()
      UIRectFill(rect)
    }

    (text as NSString).draw(at: CGPoint(x: x, y: y), withAttributes: attributes)

    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()

    return newImage ?? image
  }

  private func applyImageOverlay(_ overlay: [String: Any], to image: UIImage) async throws -> UIImage {
    if isDebugMode {
      logger.debug("Applying image overlay: \(overlay)")
    }
    guard let source = overlay["source"] as? [String: Any],
          let overlayImage = try await loadImage(from: source) else {
      throw ImageModifierError.invalidOverlaySource
    }

    let position = overlay["position"] as? [String: Double] ?? [:]
    let size = overlay["size"] as? [String: Double] ?? [:]
    let opacity = overlay["opacity"] as? Double ?? 1.0
    let rotation = overlay["rotation"] as? Double ?? 0.0

    let x = position["x"] ?? 0
    let y = position["y"] ?? 0
    let width = size["width"] ?? overlayImage.size.width
    let height = size["height"] ?? overlayImage.size.height

    UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
    let context = UIGraphicsGetCurrentContext()!

    // Draw the base image
    image.draw(at: .zero)

    // Apply the overlay
    context.saveGState()
    context.setAlpha(CGFloat(opacity))
    
    if rotation != 0 {
      let center = CGPoint(x: x + width/2, y: y + height/2)
      context.translateBy(x: center.x, y: center.y)
      context.rotate(by: CGFloat(rotation * .pi / 180))
      context.translateBy(x: -center.x, y: -center.y)
    }

    overlayImage.draw(in: CGRect(x: x, y: y, width: width, height: height))
    context.restoreGState()

    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()

    return newImage ?? image
  }

  private func applyMapOverlay(_ overlay: [String: Any], to image: UIImage) async throws -> UIImage {
    if isDebugMode {
      logger.debug("Applying map overlay: \(overlay)")
    }
    let coordinates = overlay["coordinates"] as? [String: Double] ?? [:]
    let style = overlay["style"] as? [String: Any] ?? [:]
    let markers = overlay["markers"] as? [[String: Any]] ?? []
    
    let latitude = coordinates["latitude"] ?? 0.0
    let longitude = coordinates["longitude"] ?? 0.0
    let width = style["width"] as? Double ?? 300.0
    let height = style["height"] as? Double ?? 200.0
    let zoomLevel = style["zoomLevel"] as? Double ?? 14.0
    
    // Create map snapshot
    let location = CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    let region = MKCoordinateRegion(
      center: location,
      latitudinalMeters: 1000.0 * pow(2, (15 - zoomLevel)),
      longitudinalMeters: 1000.0 * pow(2, (15 - zoomLevel))
    )
    
    let options = MKMapSnapshotter.Options()
    options.region = region
    options.size = CGSize(width: width, height: height)
    options.mapType = .standard
    
    let snapshotter = MKMapSnapshotter(options: options)
    let snapshot = try await snapshotter.start()
    
    UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
    image.draw(at: .zero)
    
    // Draw map at specified position
    let position = overlay["position"] as? [String: Double] ?? [:]
    let x = position["x"] ?? 0.0
    let y = position["y"] ?? 0.0
    snapshot.image.draw(in: CGRect(x: x, y: y, width: width, height: height))
    
    // Draw markers
    for marker in markers {
      guard let markerCoords = marker["coordinate"] as? [String: Double],
            let markerLat = markerCoords["latitude"],
            let markerLong = markerCoords["longitude"] else {
        continue
      }
      
      let markerPoint = snapshot.point(for: CLLocationCoordinate2D(
        latitude: markerLat,
        longitude: markerLong
      ))
      
      // Draw marker pin
      let pinImage = UIImage(systemName: "mappin.circle.fill")?.withTintColor(.red, renderingMode: .alwaysOriginal)
      let pinSize = CGSize(width: 30, height: 30)
      pinImage?.draw(in: CGRect(
        x: x + markerPoint.x - pinSize.width/2,
        y: y + markerPoint.y - pinSize.height,
        width: pinSize.width,
        height: pinSize.height
      ))
      
      // Draw marker title if provided
      if let title = marker["title"] as? String {
        let attributes: [NSAttributedString.Key: Any] = [
          .font: UIFont.boldSystemFont(ofSize: 12),
          .foregroundColor: UIColor.black,
          .backgroundColor: UIColor.white.withAlphaComponent(0.7)
        ]
        
        let size = (title as NSString).size(withAttributes: attributes)
        let titleRect = CGRect(
          x: x + markerPoint.x - size.width/2,
          y: y + markerPoint.y - pinSize.height - size.height - 5,
          width: size.width + 10,
          height: size.height + 5
        )
        
        UIColor.white.withAlphaComponent(0.7).setFill()
        UIBezierPath(roundedRect: titleRect, cornerRadius: 5).fill()
        
        (title as NSString).draw(
          at: CGPoint(
            x: titleRect.minX + 5,
            y: titleRect.minY + 2.5
          ),
          withAttributes: attributes
        )
      }
    }
    
    let newImage = UIGraphicsGetImageFromCurrentImageContext()
    UIGraphicsEndImageContext()
    
    return newImage ?? image
  }

  private func saveImage(_ image: UIImage, format: String, quality: Double) async throws -> [String: Any] {
    if isDebugMode {
      logger.debug("Saving image with format: \(format), quality: \(quality)")
    }
    
    let tempDir = FileManager.default.temporaryDirectory
    let fileName = "\(UUID().uuidString).\(format)"
    let fileURL = tempDir.appendingPathComponent(fileName)

    if isDebugMode {
      logger.debug("Saving to file: \(fileURL.path)")
    }

    let imageData: Data?
    if format.lowercased() == "png" {
      imageData = image.pngData()
    } else {
      imageData = image.jpegData(compressionQuality: CGFloat(quality))
    }

    guard let data = imageData else {
      if isDebugMode {
        logger.error("Failed to generate image data")
      }
      throw ImageModifierError.failedToSave
    }

    try data.write(to: fileURL)

    if isDebugMode {
      logger.debug("Image saved successfully")
    }

    return [
      "uri": fileURL.absoluteString,
      "width": image.size.width,
      "height": image.size.height
    ]
  }
}

enum ImageModifierError: Error {
  case invalidSource
  case invalidOverlaySource
  case failedToSave
}

extension UIColor {
  convenience init(hex: String) {
    var hexSanitized = hex.trimmingCharacters(in: .whitespacesAndNewlines)
    hexSanitized = hexSanitized.replacingOccurrences(of: "#", with: "")

    var rgb: UInt64 = 0

    Scanner(string: hexSanitized).scanHexInt64(&rgb)

    let red = CGFloat((rgb & 0xFF0000) >> 16) / 255.0
    let green = CGFloat((rgb & 0x00FF00) >> 8) / 255.0
    let blue = CGFloat(rgb & 0x0000FF) / 255.0

    self.init(red: red, green: green, blue: blue, alpha: 1.0)
  }
}
