'use client'

export function Testimonials() {
  const testimonials = [
    {
      name: "Pastor John Smith",
      church: "Grace Community Church",
      content: "VisionaryChurch.ai transformed how we connect with visitors. We've seen a 300% increase in first-time visitor follow-ups.",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Sarah Johnson",
      church: "Riverside Baptist",
      content: "The AI chat widget is amazing! It answers questions 24/7 and has helped us schedule over 100 visits this year.",
      image: "/placeholder-avatar.jpg"
    },
    {
      name: "Pastor Michael Chen",
      church: "New Life Fellowship",
      content: "The analytics dashboard gives us insights we never had before. We can now track our growth and optimize our outreach.",
      image: "/placeholder-avatar.jpg"
    }
  ]

  return (
    <section id="testimonials" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
            Trusted by Churches Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how churches are using VisionaryChurch.ai to grow their congregations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.church}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}