import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

interface OrderConfirmationProps {
  params: { id: string }
}

export default async function OrderConfirmation({ params }: OrderConfirmationProps) {
  const order = await client.fetch(
    `*[_type == "order" && _id == $id][0]{
      _id,
      status,
      paymentMethod,
      total,
      subtotal,
      shipping,
      customer,
      items[] {
        productId,
        title,
        price,
        quantity,
        color,
        size,
        image
      },
      bankSlipNumber,
      bankSlipImage { asset-> },
      createdAt
    }`,
    { id: params.id }
  )

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <h1 className="text-xl font-semibold text-red-600">Order not found</h1>
        <p className="text-gray-600 mt-2">Please check your confirmation link or contact support.</p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-black rounded-lg  p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed</h1>
          <p className="text-gray-100">
            Your order <span className="font-semibold">#{order._id.slice(-6).toUpperCase()}</span> has been received.
          </p>
        </div>

        {order.paymentMethod === 'bank' && (
          <div className="mb-8 border-b pb-6">
            <h2 className="text-lg font-semibold mb-4">Bank Deposit Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Bank Information</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Bank: Commercial Bank</p>
                  <p>Account Name: Your Store Name</p>
                  <p>Account Number: 1234567890</p>
                  <p>Amount: LKR {order.total.toFixed(2)}</p>
                  {order.bankSlipNumber && (
                    <p className="mt-2">Slip Number: {order.bankSlipNumber}</p>
                  )}
                </div>
              </div>

              {order.bankSlipImage?.asset && (
                <div>
                  <h3 className="font-medium mb-2">Uploaded Bank Slip</h3>
                  <div className="border rounded-md p-2">
                    <Image
                      width={300}
                      height={300}
                      src={urlFor(order.bankSlipImage).url()}
                      alt="Bank deposit slip"
                      className="object-contain max-h-48 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-200 mt-2">
                    We ll verify your payment and update you via email.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4">
            {order.items.map((item: any) => (
              <div key={`${item.productId}-${item.color}-${item.size}`} className="flex gap-4 border-b pb-4">
                <div className="relative h-20 w-20 rounded-md overflow-hidden border">
                  <Image
                    src={urlFor(item.image).url()}
                    alt={item.title}
                    width={100}
                    height={100}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-gray-50">
                    {item.color} {item.size && `• Size ${item.size}`}
                  </p>
                  <p className="text-sm">
                    {item.quantity} × LKR {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="font-medium whitespace-nowrap">
                  LKR {(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal</span>
            <span>LKR {order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Shipping</span>
            <span>LKR {order.shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
            <span>Total</span>
            <span>LKR {order.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <p className="text-sm text-gray-200 mt-4">
            Well send you a confirmation email shortly.
          </p>
        </div>
      </div>
    </div>
  )
}
