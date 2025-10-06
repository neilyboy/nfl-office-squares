'use client';

import { Card } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface PaymentConfig {
  paypalUsername: string | null;
  venmoUsername: string | null;
  allowCash: boolean;
  allowPaypal: boolean;
  allowVenmo: boolean;
}

interface PaymentInfoPanelProps {
  paymentConfig: PaymentConfig | null;
  costPerSquare: number;
}

export function PaymentInfoPanel({ paymentConfig, costPerSquare }: PaymentInfoPanelProps) {
  if (!paymentConfig) return null;

  const hasPaymentMethods = paymentConfig.allowPaypal || paymentConfig.allowVenmo || paymentConfig.allowCash;
  
  if (!hasPaymentMethods) return null;

  return (
    <Card className="p-4 space-y-4 h-fit">
      <div className="text-center">
        <h3 className="font-semibold text-lg mb-1">Payment Options</h3>
        <p className="text-sm text-muted-foreground">
          ${costPerSquare.toFixed(2)} per square
        </p>
      </div>

      <div className="space-y-4">
        {/* PayPal */}
        {paymentConfig.allowPaypal && paymentConfig.paypalUsername && (
          <div className="flex flex-col items-center space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.77.77 0 0 1 .76-.633h7.59a6.09 6.09 0 0 1 3.436.914 4.49 4.49 0 0 1 1.854 2.478 5.763 5.763 0 0 1 .123 2.658 8.333 8.333 0 0 1-2.096 4.334 6.964 6.964 0 0 1-4.74 2.072h-2.8a.77.77 0 0 0-.76.633l-.844 5.161zm5.37-12.144a.77.77 0 0 0 .76-.633l.21-1.283a.77.77 0 0 0-.76-.914H9.346a.77.77 0 0 0-.76.633l-.844 5.161a.77.77 0 0 0 .76.914h2.31a4.334 4.334 0 0 0 3.436-1.5 5.161 5.161 0 0 0 1.5-2.378z"/>
              </svg>
              <span className="font-semibold text-blue-600">PayPal</span>
            </div>
            <div className="bg-white p-2 rounded">
              <QRCodeSVG 
                value={`https://paypal.me/${paymentConfig.paypalUsername}/${costPerSquare}`}
                size={120}
                level="M"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              @{paymentConfig.paypalUsername}
            </p>
          </div>
        )}

        {/* Venmo */}
        {paymentConfig.allowVenmo && paymentConfig.venmoUsername && (
          <div className="flex flex-col items-center space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.83 4.34c.73 1.28 1.05 2.64 1.05 4.48 0 5.6-4.77 12.85-8.66 17.18H5.77L2.17 5.54l6.5-.59 1.94 14.31c1.77-2.72 4.11-7.02 4.11-10.2 0-1.64-.32-2.72-.91-3.68z"/>
              </svg>
              <span className="font-semibold text-[#008CFF]">Venmo</span>
            </div>
            <div className="bg-white p-2 rounded">
              <QRCodeSVG 
                value={`https://venmo.com/${paymentConfig.venmoUsername}?txn=pay&amount=${costPerSquare}&note=NFL%20Squares`}
                size={120}
                level="M"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              @{paymentConfig.venmoUsername}
            </p>
          </div>
        )}

        {/* Cash */}
        {paymentConfig.allowCash && (
          <div className="flex flex-col items-center space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-green-600">Cash</span>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Pay with cash in person
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-center text-muted-foreground border-t pt-3">
        Send payment after claiming your square
      </p>
    </Card>
  );
}
