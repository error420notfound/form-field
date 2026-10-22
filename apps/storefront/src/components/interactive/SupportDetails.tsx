import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
export default function SupportDetails() {
  return (
    <Accordion type="multiple" className="support-accordion">
      {[
        [
          'guides',
          'Product guides',
          'Setup, care and compatibility information have not yet been supplied. Available product details appear in each object’s story.',
        ],
        [
          'delivery',
          'Delivery',
          'Shipping regions, charges and fulfilment times are not confirmed. No delivery service is offered through this demonstration.',
        ],
        [
          'returns',
          'Returns',
          'Returns terms are not yet supplied. This local demonstration cannot accept purchases or returns.',
        ],
        [
          'checkout',
          'About demo checkout',
          'Your bag is saved in this browser. Checkout fields are for layout review only; addresses are not stored and no payment or order is submitted.',
        ],
      ].map(([id, title, copy]) => (
        <AccordionItem value={id} key={id} id={id}>
          <AccordionTrigger>{title}</AccordionTrigger>
          <AccordionContent>{copy}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
