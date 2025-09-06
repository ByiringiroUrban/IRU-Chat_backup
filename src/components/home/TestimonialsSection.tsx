
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
    {
        quote: "Integrating AI and robotics into our curriculum has transformed the educational experience for our students, making it more engaging and personalized. The improvements in student performance and enthusiasm for STEM subjects have been outstanding. We're thrilled with the positive impact on our learning environment.",
        author: "Cyusa Stessy",
        position: "CEO & Founder",
        avatar: "/Stessy.jpg",
        rating: 5
    },
    {
        quote: "The AI-powered virtual classroom solution has revolutionized how we deliver remote education. Students are more engaged, and teachers can now provide personalized attention at scale. The analytics have been invaluable for improving our curriculum.",
        author: "Kanyana",
        position: "Education Director",
        avatar: "/Kanyana.jpg",
        rating: 5
    },
    {
        quote: "Implementing the robotic lab assistants in our science program has sparked incredible creativity and interest among students. The hands-on learning experience has made complex concepts accessible and fun to explore.",
        author: "Burabyo",
        position: "STEM Coordinator",
        avatar: "/Burabyo.jpg",
        rating: 5
    }
];

const AIRoboticTestimonials = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const section = document.getElementById("ai-robotic-testimonials");
        if (section) {
            observer.observe(section);
        }

        return () => {
            if (section) {
                observer.unobserve(section);
            }
        };
    }, []);

    return (
        <section id="ai-robotic-testimonials" className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left side - Image */}
                    <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-techblue/30 to-techpurple/30 rounded-3xl transform rotate-2 opacity-70"></div>
                            <img
                                src="/cyborg-woman.jpg"
                                alt="Robot and human face comparison"
                                className="rounded-2xl shadow-xl w-full object-cover relative z-10 h-[500px]"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl z-20">
                                <h2 className="text-4xl font-bold leading-tight">
                                    What <span className="text-pink-500">people say</span> about<br />
                                    AI & Robotic education
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Right side - Testimonial carousel */}
                    <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <Carousel className="w-full">
                            <CarouselContent>
                                {testimonials.map((testimonial, index) => (
                                    <CarouselItem key={index}>
                                        <div className="bg-gradient-to-br from-emerald-400 to-green-500 p-1 rounded-3xl shadow-xl">
                                            <div className="bg-emerald-50 text-gray-800 p-8 rounded-3xl">
                                                <div className="flex mb-4">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>

                                                <blockquote className="text-xl mb-8">
                                                    "{testimonial.quote}"
                                                </blockquote>

                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                                        <img
                                                            src={testimonial.avatar}
                                                            alt={testimonial.author}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-xl">{testimonial.author}</div>
                                                        <div className="text-gray-600">{testimonial.position}</div>
                                                    </div>

                                                    <div className="ml-auto text-6xl font-serif text-emerald-300">
                                                        &rdquo;
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <div className="flex justify-center gap-2 mt-8">
                                <CarouselPrevious className="relative inset-0 translate-y-0 bg-white/20 hover:bg-white/30 text-white border-none" />
                                <CarouselNext className="relative inset-0 translate-y-0 bg-white/20 hover:bg-white/30 text-white border-none" />
                            </div>
                        </Carousel>
                    </div>
                </div>
            </div>

            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-techblue/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-techpurple/10 blur-3xl rounded-full"></div>
        </section>
    );
};

export default AIRoboticTestimonials;
