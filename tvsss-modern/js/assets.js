/* TVS Sensing Solutions — Central Image Asset Configuration & Safe Fallback Loader */
const TVSSS_IMAGES = {
    logo: "assets/images/logo.svg",
    logoWhite: "assets/images/logo-white.png",
    
    hero: {
        factory: "assets/images/factory.jpg",
        assembly: "assets/images/hero-1.jpg",
        engineering: "assets/images/hero-2.jpg",
        mobility: "assets/images/hero-3.jpg",
        banner: "assets/images/banner.jpg"
    },

    about: "assets/images/about.jpg",

    products: {
        sensors: "assets/products/sensors.jpg",
        switches: "assets/products/switches.jpg",
        solenoids: "assets/products/solenoids.jpg",
        electroMechanical: "assets/products/electromech.jpg",
        ev: "assets/products/ev.jpg",
        computerInput: "assets/products/computer.jpg",
        iot: "assets/products/iot.jpg",
        default: "assets/products/sensors.jpg"
    },

    applications: {
        twoWheeler: "assets/images/seg-two-wheeler.png",
        fourWheeler: "assets/images/seg-four-wheeler.png",
        commercial: "assets/images/seg-commercial.png",
        industrial: "assets/images/seg-industrial.png"
    },

    manufacturing: {
        molding: "assets/images/mfg1.jpg",
        stamping: "assets/images/mfg4.jpg",
        automation: "assets/images/automation.jpg",
        machine: "assets/images/machine.jpg",
        machine2: "assets/images/machine2.jpg"
    },

    iiot: "assets/images/iiot.jpg",

    customers: {
        brakesIndia: "assets/customers/brakes-india.png",
        fiat: "assets/customers/fiat.png",
        ford: "assets/customers/ford.png",
        hella: "assets/customers/hella.png",
        hyundai: "assets/customers/hyundai.png",
        jcb: "assets/customers/jcb.png",
        johnDeere: "assets/customers/john-deere.png",
        mahindra: "assets/customers/mahindra.png",
        nissan: "assets/customers/nissan.png",
        renault: "assets/customers/renault.png",
        tafe: "assets/customers/tafe.png",
        tata: "assets/customers/tata.png",
        turbo: "assets/customers/turbo.png"
    }
};

// Global Image Error Handler & Safe Asset Hydration
document.addEventListener("DOMContentLoaded", function() {
    const isSubPage = window.location.pathname.includes("/pages/");
    const assetPrefix = isSubPage ? "../assets/" : "assets/";

    const images = document.querySelectorAll("img");
    images.forEach(img => {
        // Safe onerror handler
        img.onerror = function() {
            console.warn("Image load failed, applying category fallback:", this.src);
            if (this.classList.contains("product-img") || this.closest(".product-card")) {
                this.src = assetPrefix + "products/sensors.jpg";
            } else if (this.classList.contains("customer-logo")) {
                this.src = assetPrefix + "images/logo.svg";
            } else {
                this.src = assetPrefix + "images/factory.jpg";
            }
            this.onerror = null; // Prevent infinite fallback loops
        };
    });
});
