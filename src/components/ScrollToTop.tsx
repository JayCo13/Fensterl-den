import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getConsent } from "@/lib/posthog";

export const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // Hide while the consent banner is still showing — they overlap in the
            // bottom-right corner.
            const consentResolved = getConsent() !== "unknown";
            if (window.scrollY > 300 && consentResolved) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        window.addEventListener("consent-changed", toggleVisibility);

        return () => {
            window.removeEventListener("scroll", toggleVisibility);
            window.removeEventListener("consent-changed", toggleVisibility);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isVisible && (
                <Button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 rounded-full h-12 w-12 p-0 shadow-xl bg-primary hover:bg-primary/90 animate-in fade-in zoom-in duration-300"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </Button>
            )}
        </>
    );
};
