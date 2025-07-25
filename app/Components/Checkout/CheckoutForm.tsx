'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { client } from '@/sanity/lib/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CreditCard, Truck, Banknote, Loader2, User, Mail, Phone, Home, MapPin, Info } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { reduceStock } from '../utils/stock'
import { BankSlipUpload } from './BankSlipUpload'

interface CartItem {
  productId: string
  title: string
  price: number
  quantity: number
  color?: string
  size?: string
  image: string
}

interface CheckoutFormProps {
  cartItems: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
}

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  address: z.string().min(10, { message: 'Address must be at least 10 characters' }),
  city: z.string().min(2, { message: 'City must be at least 2 characters' }),
  paymentMethod: z.enum(['payhere', 'cod', 'bank']),
  bankSlipNumber: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface PayHerePaymentParams {
  sandbox: boolean
  merchant_id: string
  return_url: string
  cancel_url: string
  notify_url: string
  order_id: string
  items: string
  amount: string
  currency: string
  first_name: string
  last_name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  delivery_address: string
  delivery_city: string
  delivery_country: string
  custom_1: string
  custom_2: string
  onCompleted: (orderId: string) => void
  onDismissed: () => void
  onError: (error: any) => void
}

declare global {
  interface Window {
    payhere: {
      startPayment: (payment: PayHerePaymentParams) => void
      onCompleted?: (orderId: string) => void
      onDismissed?: () => void
      onError?: (error: any) => void
    }
  }
}

export function CheckoutForm({ cartItems, subtotal, shippingCost, total }: CheckoutFormProps) {
  const [bankSlipFile, setBankSlipFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [payhereReady, setPayhereReady] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      paymentMethod: 'payhere',
      bankSlipNumber: '',
    },
  })

  const paymentMethod = form.watch('paymentMethod')

  // Load PayHere script
  useEffect(() => {
    const existingScript = document.querySelector('script[src^="https://www.payhere.lk/lib/payhere.js"]')
    if (existingScript) {
      setPayhereReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://sandbox.payhere.lk/lib/payhere.js' // Sandbox for testing
    script.async = true
    script.onload = () => {
      setPayhereReady(true)
      toast.info('PayHere Sandbox Loaded', {
        description: 'Test payment system ready',
        icon: <CreditCard className="w-4 h-4" />,
      })
    }
    script.onerror = () => {
      toast.error('Failed to load PayHere SDK')
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleFieldFocus = (fieldName: string) => {
    switch (fieldName) {
      case 'firstName':
        toast.info('First Name', {
          description: 'Please enter your legal first name',
          icon: <User className="w-4 h-4" />,
        })
        break
      case 'lastName':
        toast.info('Last Name', {
          description: 'Please enter your legal last name',
          icon: <User className="w-4 h-4" />,
        })
        break
      case 'email':
        toast.info('Email', {
          description: "We'll send your order confirmation here",
          icon: <Mail className="w-4 h-4" />,
        })
        break
      case 'phone':
        toast.info('Phone', {
          description: 'For delivery updates and order tracking',
          icon: <Phone className="w-4 h-4" />,
        })
        break
      case 'address':
        toast.info('Address', {
          description: 'Include building number and street name',
          icon: <Home className="w-4 h-4" />,
        })
        break
      case 'city':
        toast.info('City', {
          description: 'Your delivery location city',
          icon: <MapPin className="w-4 h-4" />,
        })
        break
    }
  }

  const handlePaymentMethodChange = (value: string) => {
    form.setValue('paymentMethod', value as FormValues['paymentMethod'])

    switch (value) {
      case 'payhere':
        toast('Secure Payment', {
          description: "You'll be redirected to PayHere for card payment",
          icon: <CreditCard className="w-5 h-5" />,
          action: {
            label: 'Test Cards',
            onClick: () => showSandboxInfo(),
          },
        })
        break
      case 'cod':
        toast('Cash on Delivery', {
          description: 'Pay when your order arrives at your doorstep',
          icon: <Truck className="w-5 h-5" />,
        })
        break
      case 'bank':
        toast('Bank Transfer', {
          description: 'Upload your deposit slip after payment',
          icon: <Banknote className="w-5 h-5" />,
        })
        break
    }
  }

  const showSandboxInfo = () => {
    toast.info('Sandbox Test Cards', {
      description: (
        <div className="space-y-2 text-sm">
          <p><strong>VISA:</strong> 4916217501611292</p>
          <p><strong>Mastercard:</strong> 5304572425535384</p>
          <p><strong>AMEX:</strong> 346781005510225</p>
          <p>Use any future expiry date and CVV 123</p>
        </div>
      ),
      duration: 10000,
      icon: <Info className="w-4 h-4" />,
    })
  }

  const uploadImageToSanity = async (file: File) => {
    setIsUploading(true)
    setUploadProgress(0)
    try {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
        contentType: file.type,
        onProgress: (event) => {
          setUploadProgress(Math.round((event.loaded / event.total) * 100))
        },
      })
      return {
        _type: 'image',
        asset: { _type: 'reference', _ref: asset._id },
      }
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const startPayHerePayment = async (createdOrder: any, values: FormValues) => {
    if (!window.payhere || !payhereReady) {
      toast.error('Payment system not ready. Please try again later.')
      setIsSubmitting(false)
      return
    }

    try {
      const payment: PayHerePaymentParams = {
        sandbox: true, // Set to false for production
        merchant_id: '1231068', // Sandbox merchant ID
        return_url: `${window.location.origin}/order-confirmation/${createdOrder._id}?sandbox=true`,
        cancel_url: `${window.location.origin}/order-cancelled/${createdOrder._id}`,
        notify_url: `${window.location.origin}/api/payhere/notify`,
        order_id: createdOrder._id,
        items: cartItems.map(i => i.title).join(', ').substring(0, 50),
        amount: total.toFixed(2),
        currency: 'LKR',
        first_name: values.firstName,
        last_name: values.lastName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        city: values.city,
        country: 'Sri Lanka',
        delivery_address: values.address,
        delivery_city: values.city,
        delivery_country: 'Sri Lanka',
        custom_1: createdOrder._id,
        custom_2: 'sandbox_order',
        onCompleted: (orderId: string) => {
          toast.success('Payment Completed', {
            description: `Payment successful for order ${orderId}`,
          })
          client.patch(createdOrder._id)
            .set({ 
              status: 'paid',
              paymentId: orderId,
              paidAt: new Date().toISOString()
            })
            .commit()
            .then(() => {
              window.location.href = `/order-confirmation/${createdOrder._id}?sandbox=true`
            })
        },
        onDismissed: () => {
          toast.warning('Payment Cancelled', {
            description: 'You closed the payment window',
          })
          setIsSubmitting(false)
        },
        onError: (error: any) => {
          console.error('Payment error:', error)
          toast.error('Payment Failed', {
            description: error.message || 'An error occurred during payment',
          })
          setIsSubmitting(false)
        }
      }

      window.payhere.onCompleted = payment.onCompleted
      window.payhere.onDismissed = payment.onDismissed
      window.payhere.onError = payment.onError

      window.payhere.startPayment(payment)
    } catch (error) {
      console.error('Error starting payment:', error)
      toast.error('Failed to initiate payment')
      setIsSubmitting(false)
    }
  }

  const onSubmit = async (values: FormValues) => {
    if (!cartItems.length) {
      toast.error('Empty Cart', {
        description: 'Your cart is empty. Please add items to checkout',
      })
      return
    }

    if (values.paymentMethod === 'bank') {
      if (!bankSlipFile) {
        toast.error('Bank Slip Required', {
          description: 'Please upload your bank deposit slip',
        })
        return
      }
      if (!values.bankSlipNumber) {
        toast.error('Slip Number Required', {
          description: 'Please enter your bank slip reference number',
        })
        return
      }
    }

    const toastId = toast.loading('Processing your order...')
    setIsSubmitting(true)

    try {
      const orderData: any = {
        _type: 'order',
        status: 'pending',
        paymentMethod: values.paymentMethod,
        subtotal,
        shipping: shippingCost,
        total,
        items: cartItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          ...(item.color && { color: item.color }),
          ...(item.size && { size: item.size }),
          image: item.image,
        })),
        customer: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          address: values.address,
          city: values.city,
        },
      }

      if (values.paymentMethod === 'bank') {
        const image = await uploadImageToSanity(bankSlipFile!)
        orderData.bankSlipImage = image
        orderData.bankSlipNumber = values.bankSlipNumber
      }

      const createdOrder = await client.create(orderData)
      await reduceStock(cartItems)

      if (values.paymentMethod === 'payhere') {
        startPayHerePayment(createdOrder, values)
      } else {
        toast.success('Order Placed!', {
          id: toastId,
          description: 'Your order has been confirmed',
        })
        window.location.href = `/order-confirmation/${createdOrder._id}`
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Order Failed', {
        id: toastId,
        description: 'Something went wrong. Please try again',
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-black p-6 rounded-lg max-w-xl mx-auto text-white">
      <h2 className="text-2xl font-semibold border-b border-gray-700 pb-4 uppercase tracking-wide">
        Checkout
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" onClick={() => handleFieldFocus('firstName')}>
            First Name
          </Label>
          <Input
            {...form.register('firstName')}
            placeholder="John"
            className="bg-neutral-900 border-gray-700 focus:ring-red-500"
            onFocus={() => handleFieldFocus('firstName')}
          />
          {form.formState.errors.firstName && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.firstName.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName" onClick={() => handleFieldFocus('lastName')}>
            Last Name
          </Label>
          <Input
            {...form.register('lastName')}
            placeholder="Doe"
            className="bg-neutral-900 border-gray-700 focus:ring-red-500"
            onFocus={() => handleFieldFocus('lastName')}
          />
          {form.formState.errors.lastName && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label onClick={() => handleFieldFocus('email')}>Email</Label>
        <Input
          {...form.register('email')}
          placeholder="your@email.com"
          className="bg-neutral-900 border-gray-700 focus:ring-red-500"
          onFocus={() => handleFieldFocus('email')}
        />
        {form.formState.errors.email && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label onClick={() => handleFieldFocus('phone')}>Phone</Label>
        <Input
          {...form.register('phone')}
          placeholder="0771234567"
          className="bg-neutral-900 border-gray-700 focus:ring-red-500"
          onFocus={() => handleFieldFocus('phone')}
        />
        {form.formState.errors.phone && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <Label onClick={() => handleFieldFocus('address')}>Address</Label>
        <Textarea
          {...form.register('address')}
          placeholder="123 Street, Apartment 4B"
          className="bg-neutral-900 border-gray-700 focus:ring-red-500"
          onFocus={() => handleFieldFocus('address')}
        />
        {form.formState.errors.address && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.address.message}
          </p>
        )}
      </div>

      <div>
        <Label onClick={() => handleFieldFocus('city')}>City</Label>
        <Input
          {...form.register('city')}
          placeholder="Colombo"
          className="bg-neutral-900 border-gray-700 focus:ring-red-500"
          onFocus={() => handleFieldFocus('city')}
        />
        {form.formState.errors.city && (
          <p className="text-red-500 text-xs mt-1">
            {form.formState.errors.city.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg uppercase">Payment Method</h3>
          {paymentMethod === 'payhere' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={showSandboxInfo}
              className="text-xs flex items-center gap-1"
            >
              <Info className="w-3 h-3" /> Test Cards
            </Button>
          )}
        </div>
        <RadioGroup
          defaultValue="payhere"
          className="space-y-4 pt-2"
          onValueChange={handlePaymentMethodChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="payhere"
              id="payhere"
              className="text-white bg-white"
            />
            <Label htmlFor="payhere" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Pay with PayHere
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="cod"
              id="cod"
              className="text-white bg-white"
            />
            <Label htmlFor="cod" className="flex items-center gap-2">
              <Truck className="h-4 w-4" /> Cash on Delivery
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="bank"
              id="bank"
              className="text-white bg-white"
            />
            <Label htmlFor="bank" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" /> Bank Transfer
            </Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === 'bank' && (
        <div className="bg-neutral-900 p-4 rounded-lg border border-gray-700 space-y-4">
          <div>
            <Label htmlFor="bankSlipNumber">Slip Number</Label>
            <Input
              {...form.register('bankSlipNumber')}
              placeholder="Slip Number"
              className="bg-black border-gray-700 focus:ring-red-500"
            />
          </div>
          <div>
            <Label>Upload Bank Slip</Label>
            <BankSlipUpload
              onFileUpload={(file) => setBankSlipFile(file)}
              onFileRemove={() => setBankSlipFile(null)}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </div>
          <div className="text-sm space-y-1 text-gray-400">
            <p>Bank: Commercial Bank</p>
            <p>Account Name: Reluxe Clothing</p>
            <p>Account Number: 123456789</p>
            <p>Branch: Main Branch</p>
            <p className="font-semibold text-white mt-2">Amount: LKR {total.toFixed(2)}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700 transition rounded-lg py-2"
        disabled={isUploading || isSubmitting}
      >
        {isUploading || isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          `Complete ${paymentMethod === 'cod' ? 'Order' : 'Payment'}`
        )}
      </Button>
    </form>
  )
}