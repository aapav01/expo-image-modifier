package expo.modules.imagemodifier

import android.graphics.*
import android.graphics.drawable.Drawable
import android.net.Uri
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.exception.Exceptions
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.FileOutputStream
import java.net.URL
import java.util.concurrent.Executors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import android.util.Base64
import android.content.Context
import android.graphics.Typeface
import java.io.IOException
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import com.google.android.gms.maps.CameraUpdateFactory
import android.graphics.drawable.BitmapDrawable
import com.google.android.gms.maps.MapsInitializer
import android.view.View
import android.widget.FrameLayout
import com.google.android.gms.maps.MapView
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import android.util.Log

class ExpoImageModifierModule : Module() {
  private val executor = Executors.newSingleThreadExecutor()
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()
  private var isDebugMode = false

  override fun definition() = ModuleDefinition {
    Name("ExpoImageModifier")

    Function("setDebugMode") { enabled: Boolean ->
      isDebugMode = enabled
      Log.d("ExpoImageModifier", "Debug mode ${if (enabled) "enabled" else "disabled"}")
    }

    AsyncFunction("modifyImage") { options: Map<String, Any> ->
      withContext(Dispatchers.IO) {
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Starting image modification with options: $options")
        }

        val source = options["source"] as? Map<String, Any>
          ?: throw IllegalArgumentException("Source is required")
        
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Loading source image: $source")
        }
        
        val bitmap = loadImage(source)
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Source image loaded: ${bitmap.width}x${bitmap.height}")
        }
        
        var modifiedBitmap = bitmap.copy(bitmap.config, true)
        
        val overlays = options["overlays"] as? Map<String, Any>
        if (overlays != null) {
          // Apply text overlays
          val textOverlays = overlays["text"] as? List<Map<String, Any>>
          if (textOverlays != null) {
            if (isDebugMode) {
              Log.d("ExpoImageModifier", "Applying ${textOverlays.size} text overlays")
            }
            for (overlay in textOverlays) {
              modifiedBitmap = applyTextOverlay(overlay, modifiedBitmap)
            }
          }
          
          // Apply image overlays
          val imageOverlays = overlays["images"] as? List<Map<String, Any>>
          if (imageOverlays != null) {
            if (isDebugMode) {
              Log.d("ExpoImageModifier", "Applying ${imageOverlays.size} image overlays")
            }
            for (overlay in imageOverlays) {
              modifiedBitmap = applyImageOverlay(overlay, modifiedBitmap)
            }
          }

          // Apply map overlays
          val mapOverlays = overlays["maps"] as? List<Map<String, Any>>
          if (mapOverlays != null) {
            if (isDebugMode) {
              Log.d("ExpoImageModifier", "Applying ${mapOverlays.size} map overlays")
            }
            for (overlay in mapOverlays) {
              modifiedBitmap = applyMapOverlay(overlay, modifiedBitmap)
            }
          }
        }

        val outputFormat = options["outputFormat"] as? String ?: "jpeg"
        val quality = (options["quality"] as? Double ?: 0.92).toFloat()
        
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Saving image with format: $outputFormat, quality: $quality")
        }
        
        saveImage(modifiedBitmap, outputFormat, quality)
      }
    }

    AsyncFunction("loadImage") { source: Map<String, Any> ->
      withContext(Dispatchers.IO) {
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Loading image from source: $source")
        }
        val bitmap = loadImage(source)
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Image loaded successfully: ${bitmap.width}x${bitmap.height}")
        }
        mapOf(
          "uri" to (source["uri"] as? String ?: ""),
          "width" to bitmap.width,
          "height" to bitmap.height
        )
      }
    }
  }

  private fun loadImage(source: Map<String, Any>): Bitmap {
    return when {
      source["uri"] != null -> {
        val uri = Uri.parse(source["uri"] as String)
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Loading image from URI: $uri")
        }
        when (uri.scheme) {
          "http", "https" -> {
            val url = URL(uri.toString())
            BitmapFactory.decodeStream(url.openStream())
          }
          "file" -> {
            BitmapFactory.decodeFile(uri.path)
          }
          "content" -> {
            context.contentResolver.openInputStream(uri)?.use {
              BitmapFactory.decodeStream(it)
            } ?: throw IOException("Failed to open content URI")
          }
          else -> throw IllegalArgumentException("Unsupported URI scheme: ${uri.scheme}")
        }
      }
      source["base64"] != null -> {
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Loading image from base64 string")
        }
        val base64 = source["base64"] as String
        val imageBytes = Base64.decode(base64, Base64.DEFAULT)
        BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.size)
      }
      source["localPath"] != null -> {
        if (isDebugMode) {
          Log.d("ExpoImageModifier", "Loading image from local path: ${source["localPath"]}")
        }
        BitmapFactory.decodeFile(source["localPath"] as String)
      }
      else -> throw IllegalArgumentException("Invalid image source")
    }
  }

  private fun applyTextOverlay(overlay: Map<String, Any>, bitmap: Bitmap): Bitmap {
    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Applying text overlay: $overlay")
    }
    val text = overlay["text"] as? String ?: ""
    val position = overlay["position"] as? Map<String, Double> ?: emptyMap()
    val style = overlay["style"] as? Map<String, Any> ?: emptyMap()
    
    val x = (position["x"] ?: 0.0).toFloat()
    val y = (position["y"] ?: 0.0).toFloat()
    val fontSize = (style["fontSize"] as? Double ?: 16.0).toFloat()
    val color = parseColor(style["color"] as? String ?: "#000000")
    val fontFamily = style["fontFamily"] as? String ?: "sans-serif"
    val backgroundColor = style["backgroundColor"] as? String?.let { parseColor(it) }
    val opacity = (style["opacity"] as? Double ?: 1.0).toFloat()

    val canvas = Canvas(bitmap)
    val paint = Paint().apply {
      this.color = color
      this.alpha = (opacity * 255).toInt()
      this.textSize = fontSize
      this.typeface = Typeface.create(fontFamily, Typeface.NORMAL)
    }

    val textBounds = Rect()
    paint.getTextBounds(text, 0, text.length, textBounds)

    if (backgroundColor != null) {
      val bgPaint = Paint().apply {
        this.color = backgroundColor
        this.alpha = (opacity * 255).toInt()
      }
      canvas.drawRect(
        x,
        y - textBounds.height(),
        x + textBounds.width(),
        y,
        bgPaint
      )
    }

    canvas.drawText(text, x, y, paint)
    return bitmap
  }

  private fun applyImageOverlay(overlay: Map<String, Any>, bitmap: Bitmap): Bitmap {
    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Applying image overlay: $overlay")
    }
    val source = overlay["source"] as? Map<String, Any>
      ?: throw IllegalArgumentException("Overlay source is required")
    
    val overlayBitmap = loadImage(source)
    val position = overlay["position"] as? Map<String, Double> ?: emptyMap()
    val size = overlay["size"] as? Map<String, Double> ?: emptyMap()
    val opacity = (overlay["opacity"] as? Double ?: 1.0).toFloat()
    val rotation = (overlay["rotation"] as? Double ?: 0.0).toFloat()

    val x = (position["x"] ?: 0.0).toFloat()
    val y = (position["y"] ?: 0.0).toFloat()
    val width = (size["width"] ?: overlayBitmap.width.toDouble()).toFloat()
    val height = (size["height"] ?: overlayBitmap.height.toDouble()).toFloat()

    val canvas = Canvas(bitmap)
    val paint = Paint().apply {
      this.alpha = (opacity * 255).toInt()
    }

    canvas.save()
    if (rotation != 0f) {
      canvas.rotate(
        rotation,
        x + width / 2,
        y + height / 2
      )
    }
    canvas.drawBitmap(
      Bitmap.createScaledBitmap(overlayBitmap, width.toInt(), height.toInt(), true),
      x,
      y,
      paint
    )
    canvas.restore()

    return bitmap
  }

  private suspend fun applyMapOverlay(overlay: Map<String, Any>, bitmap: Bitmap): Bitmap {
    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Applying map overlay: $overlay")
    }
    val coordinates = overlay["coordinates"] as? Map<String, Double> ?: emptyMap()
    val style = overlay["style"] as? Map<String, Any> ?: emptyMap()
    val markers = overlay["markers"] as? List<Map<String, Any>> ?: emptyList()
    
    val latitude = coordinates["latitude"] ?: 0.0
    val longitude = coordinates["longitude"] ?: 0.0
    val width = (style["width"] as? Double ?: 300.0).toInt()
    val height = (style["height"] as? Double ?: 200.0).toInt()
    val zoomLevel = (style["zoomLevel"] as? Double ?: 14.0).toFloat()

    // Initialize map
    MapsInitializer.initialize(context)
    val mapView = MapView(context)
    mapView.onCreate(null)
    
    val mapBitmap = suspendCancellableCoroutine { continuation ->
      mapView.getMapAsync { googleMap ->
        try {
          // Configure map
          googleMap.moveCamera(CameraUpdateFactory.newLatLngZoom(
            LatLng(latitude, longitude),
            zoomLevel
          ))
          googleMap.mapType = GoogleMap.MAP_TYPE_NORMAL
          googleMap.uiSettings.isAllGesturesEnabled = false

          // Add markers
          for (marker in markers) {
            val markerCoords = marker["coordinate"] as? Map<String, Double>
            val markerLat = markerCoords?.get("latitude")
            val markerLong = markerCoords?.get("longitude")
            val title = marker["title"] as? String
            
            if (markerLat != null && markerLong != null) {
              val markerOptions = MarkerOptions()
                .position(LatLng(markerLat, markerLong))
                .title(title)
              googleMap.addMarker(markerOptions)
            }
          }

          // Set map size
          val measureSpec = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED)
          mapView.measure(measureSpec, measureSpec)
          mapView.layout(0, 0, width, height)

          // Create bitmap from map
          val mapBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
          val canvas = Canvas(mapBitmap)
          mapView.draw(canvas)
          
          continuation.resume(mapBitmap)
        } catch (e: Exception) {
          continuation.resumeWithException(e)
        }
      }
    }

    // Draw map on the image
    val position = overlay["position"] as? Map<String, Double> ?: emptyMap()
    val x = (position["x"] ?: 0.0).toFloat()
    val y = (position["y"] ?: 0.0).toFloat()

    val canvas = Canvas(bitmap)
    canvas.drawBitmap(mapBitmap, x, y, null)

    mapView.onDestroy()
    return bitmap
  }

  private fun saveImage(bitmap: Bitmap, format: String, quality: Float): Map<String, Any> {
    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Saving image with format: $format, quality: $quality")
    }
    val outputDir = context.cacheDir
    val outputFile = File.createTempFile("modified_image", ".$format", outputDir)
    
    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Saving to file: ${outputFile.absolutePath}")
    }
    
    FileOutputStream(outputFile).use { out ->
      when (format.lowercase()) {
        "png" -> bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        else -> bitmap.compress(Bitmap.CompressFormat.JPEG, (quality * 100).toInt(), out)
      }
    }

    if (isDebugMode) {
      Log.d("ExpoImageModifier", "Image saved successfully")
    }

    return mapOf(
      "uri" to Uri.fromFile(outputFile).toString(),
      "width" to bitmap.width,
      "height" to bitmap.height
    )
  }

  private fun parseColor(colorString: String): Int {
    return try {
      Color.parseColor(colorString)
    } catch (e: IllegalArgumentException) {
      if (isDebugMode) {
        Log.e("ExpoImageModifier", "Failed to parse color: $colorString", e)
      }
      Color.BLACK
    }
  }
}
