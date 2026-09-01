import { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { useCameraPermissions, CameraView } from 'expo-camera';
import { colors, spacing } from '@sarangi/ui-tokens';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: spacing.md }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" color={colors.brand.primary} />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    setScanned(true);
    // Expecting data to contain "ORDER:NV-..." 
    const orderMatch = data.match(/ORDER:(NV-[A-Z0-9]+)/);
    
    if (orderMatch && orderMatch[1]) {
      const orderNumber = orderMatch[1];
      Alert.alert('Scanned Order', `${orderNumber}\nIn a complete implementation, this would navigate to the order detail screen or process an immediate action.`);
      
      // Let user scan again after a delay
      setTimeout(() => setScanned(false), 2000);
    } else {
      Alert.alert('Invalid QR Code', `Data: ${data}`);
      setTimeout(() => setScanned(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417", "aztec", "ean13", "code128"],
        }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanTarget} />
        <Text style={styles.instructionText}>Align QR code within the frame to scan.</Text>
      </View>
      {scanned && (
        <View style={styles.scannedBanner}>
          <Text style={styles.scannedText}>Processing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scanTarget: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: 'transparent',
  },
  instructionText: {
    color: '#fff',
    marginTop: spacing.xl,
    fontSize: 16,
    fontWeight: '600',
  },
  scannedBanner: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: colors.brand.primary,
    padding: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  scannedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
