import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { colors, spacing } from '@sarangi/ui-tokens';
import { useCart } from '../../src/context/cart-context';
import { useAuth } from '../../src/context/auth-context';
import { apiClient } from '../../src/lib/api';
import { formatPrice } from '../../src/lib/format';
import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, refresh: refreshCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Payment integration states
  const [showMockModal, setShowMockModal] = useState(false);
  const [paymentSession, setPaymentSession] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Sign in required', 'Please sign in to place an order.');
      router.replace('/(tabs)/account');
    }
  }, [isAuthenticated, router]);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) return;
    setSubmitting(true);
    try {
      // 1. Create order (returns Order in PENDING_PAYMENT status)
      const res = await apiClient.store.placeOrder({ note });
      const orderData = res.data;
      setCurrentOrder(orderData);

      // 2. Create Payment Session
      const sessionRes = await apiClient.store.createPaymentSession({ paymentId: orderData.paymentId! });
      const session = sessionRes.data;
      setPaymentSession(session);

      if (session.isMock) {
        setShowMockModal(true);
      } else {
        const options = {
          description: `Order ${orderData.orders[0]?.orderNumber}`,
          image: 'https://sarangi.com/logo.png', // Replace with actual logo URL
          currency: session.currency,
          key: session.keyId,
          amount: session.amount,
          name: 'Sarangi Jewels',
          order_id: session.providerOrderId,
          theme: { color: '#6B2230' }
        };

        try {
          const data = await RazorpayCheckout.open(options);
          // Verify on backend
          setSubmitting(true);
          await apiClient.store.verifyPayment({
            paymentId: orderData.paymentId!,
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
          });
          await refreshCart();
          setSuccess(orderData.orders[0]?.orderNumber);
        } catch (error: any) {
          Alert.alert('Payment Error', error.description || 'Payment failed or was cancelled');
        } finally {
          setSubmitting(false);
        }
      }
    } catch (err: any) {
      Alert.alert('Checkout Error', err?.message || 'Could not place order');
      setSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!currentOrder || !paymentSession) return;
    setSubmitting(true);
    setShowMockModal(false);

    try {
      await apiClient.store.verifyPayment({
        paymentId: currentOrder.paymentId,
        razorpayOrderId: paymentSession.providerOrderId,
        razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        razorpaySignature: 'mock_signature_verified',
      });
      await refreshCart();
      setSuccess(currentOrder.orders[0]?.orderNumber);
    } catch (err: any) {
      Alert.alert('Payment Error', err?.message || 'Verification of payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Order Confirmed', headerBackVisible: false }} />
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Order confirmed</Text>
          <Text style={styles.successText}>
            Thank you! Your order {success} has been placed and payment has been processed successfully.
          </Text>
          <Pressable style={styles.btn} onPress={() => router.replace('/(tabs)/shop')}>
            <Text style={styles.btnText}>Continue Shopping</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Checkout' }} />
        <Text style={styles.emptyText}>Your bag is empty.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Checkout' }} />

      <Text style={styles.title}>Complete your order</Text>
      <Text style={styles.subtitle}>
        Verify your items and proceed with secure payment.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Order summary</Text>
        {cart.lines.map((line) => (
          <View key={line.id} style={styles.lineItem}>
            <Text style={styles.lineName}>
              {line.productName} × {line.quantity}
            </Text>
            <Text style={styles.linePrice}>{formatPrice(line.lineTotalCents, line.currency)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(cart.subtotalCents, cart.currency)}</Text>
        </View>
      </View>

      <View style={styles.noteSection}>
        <Text style={styles.label}>Order note (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Gift message, delivery instructions…"
          placeholderTextColor="rgba(33, 29, 25, 0.4)"
          multiline
          numberOfLines={3}
          value={note}
          onChangeText={setNote}
        />
      </View>

      <Pressable style={styles.btn} onPress={handlePlaceOrder} disabled={submitting}>
        {submitting ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator color={colors.neutral[50]} size="small" />
            <Text style={styles.btnText}>Processing…</Text>
          </View>
        ) : (
          <Text style={styles.btnText}>Place Order & Pay</Text>
        )}
      </Pressable>

      {/* Sandbox Payment Simulator Modal */}
      <Modal
        visible={showMockModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowMockModal(false);
          setSubmitting(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>💳</Text>
            <Text style={styles.modalTitle}>Sarangi Jewels Sandbox Payment</Text>
            <Text style={styles.modalText}>
              You are running in development mode. Press below to simulate a successful transaction for order{' '}
              <Text style={{ fontWeight: 'bold' }}>{currentOrder?.orders?.[0]?.orderNumber}</Text>.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.btn} onPress={handleSimulatePaymentSuccess}>
                <Text style={styles.btnText}>Simulate Successful Payment</Text>
              </Pressable>
              <Pressable
                style={styles.modalBtnSecondary}
                onPress={() => {
                  setShowMockModal(false);
                  setSubmitting(false);
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Cancel Transaction</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.neutral[50] },
  scroll: { flex: 1, backgroundColor: colors.neutral[50] },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '700', color: colors.brand.primary, fontFamily: 'serif' },
  subtitle: { marginTop: spacing.sm, fontSize: 14, color: 'rgba(33, 29, 25, 0.7)', lineHeight: 20 },
  summaryCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.neutral.cream,
    borderRadius: 4,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.brand.primary, marginBottom: spacing.md },
  lineItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  lineName: { fontSize: 14, color: colors.neutral.ink },
  linePrice: { fontSize: 14, fontWeight: '600', color: colors.neutral.ink },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.08)',
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: colors.brand.primary },
  totalValue: { fontSize: 15, fontWeight: '700', color: colors.brand.primary },
  noteSection: { marginTop: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.neutral.ink, marginBottom: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.12)',
    borderRadius: 4,
    padding: spacing.md,
    fontSize: 15,
    backgroundColor: colors.neutral.cream,
    textAlignVertical: 'top',
    color: colors.neutral.ink,
  },
  btn: {
    marginTop: spacing.xl,
    backgroundColor: colors.brand.primary,
    borderRadius: 4,
    paddingVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  btnText: { color: colors.neutral[50], fontWeight: '700', fontSize: 15 },
  emptyText: { fontSize: 16, color: colors.neutral.ink },
  successCard: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.neutral.cream, borderWidth: 1, borderColor: 'rgba(33, 29, 25, 0.08)', borderRadius: 4 },
  successIcon: { fontSize: 48, color: colors.brand.primary, marginBottom: spacing.md },
  successTitle: { fontSize: 24, fontWeight: '700', color: colors.brand.primary, fontFamily: 'serif' },
  successText: { marginTop: spacing.sm, textAlign: 'center', color: colors.neutral.ink, lineHeight: 22 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(33, 29, 25, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.neutral.cream,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.15)',
    borderRadius: 4,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#211D19',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalIcon: {
    fontSize: 40,
    color: colors.brand.primary,
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.brand.primary,
    marginBottom: spacing.sm,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  modalText: {
    fontSize: 13,
    color: 'rgba(33, 29, 25, 0.7)',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalActions: {
    width: '100%',
    gap: spacing.sm,
  },
  modalBtnSecondary: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(33, 29, 25, 0.15)',
    borderRadius: 4,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    color: colors.neutral.ink,
    fontWeight: '600',
    fontSize: 15,
  },
});
