// Add this to a new file: assets/product-card-variant-switcher.js
class ProductCardVariantSwitcher {
  constructor(sectionId) {
    this.sectionId = sectionId;

    // Clean the section ID - remove 'shopify-section-' prefix if it exists
    this.cleanSectionId = sectionId.replace('shopify-section-', '');

    this.productImage = document.getElementById(
      `product-image-${this.cleanSectionId}`
    );
    this.secondaryImage = document.getElementById(
      `product-image-secondary-${this.cleanSectionId}`
    );

    // Try both possible IDs for the variant data
    let variantDataElement = document.getElementById(
      `variant-images-${this.cleanSectionId}`
    );
    if (!variantDataElement) {
      variantDataElement = document.getElementById(
        `variant-images-${sectionId}`
      );
    }

    if (!variantDataElement) {
      return;
    }

    if (!this.productImage) {
      return;
    }

    try {
      this.variantData = JSON.parse(variantDataElement.textContent);
    } catch (error) {
      return;
    }

    this.init();
  }

  init() {
    // Try multiple selectors with both section IDs
    const selectors = [
      `[data-section="${this.cleanSectionId}"] input[type="radio"]`,
      `[data-section="${this.sectionId}"] input[type="radio"]`,
      `[data-section="${this.cleanSectionId}"] .variant-input`,
      `[data-section="${this.sectionId}"] .variant-input`,
      `#variant-radios-${this.cleanSectionId} input[type="radio"]`,
      `#variant-radios-${this.sectionId} input[type="radio"]`,
      `.product-card-tshirt-section input[type="radio"]`,
    ];

    let variantInputs = [];

    for (const selector of selectors) {
      variantInputs = document.querySelectorAll(selector);
      if (variantInputs.length > 0) {
        break;
      }
    }

    if (variantInputs.length === 0) {
      return;
    }

    this.attachListeners(variantInputs);
  }

  attachListeners(inputs) {
    inputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        this.handleVariantChange(e.target);
      });

      input.addEventListener('click', (e) => {
        this.handleVariantChange(e.target);
      });
    });
  }

  handleVariantChange(input) {
    // Method 1: Try direct variant ID match
    if (this.variantData[input.value]) {
      this.updateImages(input.value);
      return;
    }

    // Method 2: Try to find variant by color name
    const colorName = input.value;

    for (const [variantId, variantInfo] of Object.entries(this.variantData)) {
      if (
        variantInfo.title &&
        variantInfo.title.toLowerCase().includes(colorName.toLowerCase())
      ) {
        this.updateImages(variantId);
        return;
      }
    }
  }

  updateImages(variantId) {
    if (this.variantData[variantId] && this.productImage) {
      // Update primary image
      this.productImage.src = this.variantData[variantId].featured_image;
      this.productImage.alt = this.variantData[variantId].alt;

      // Update secondary image if it exists
      if (this.secondaryImage && this.variantData[variantId].secondary_image) {
        this.secondaryImage.src = this.variantData[variantId].secondary_image;
        this.secondaryImage.alt =
          this.variantData[variantId].alt + ' - Secondary View';
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const productCards = document.querySelectorAll(
    '.product-card-tshirt-section'
  );

  productCards.forEach((card, index) => {
    // Get the section ID from the card's ID attribute
    let sectionId =
      card.id || card.dataset.sectionId || card.getAttribute('data-section-id');

    // If no ID found, try to extract from child elements
    if (!sectionId) {
      const productImage = card.querySelector('[id^="product-image-"]');
      if (productImage) {
        sectionId = productImage.id.replace('product-image-', '');
      }
    }

    if (sectionId) {
      new ProductCardVariantSwitcher(sectionId);
    }
  });
});
