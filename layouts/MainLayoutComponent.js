const MainLayoutComponent = {
  template: `
    <!-- Navigation -->
    <nav-component></nav-component>

    <!-- Main Content -->
    <main class="pt-16 flex-grow">
      <!-- Section Component -->
      <section-component></section-component>
    </main>
    
    <!-- Footer -->
    <footer-component></footer-component>
  `,
  components: {
    "nav-component": NavComponent,
    "footer-component": FooterComponent,
    "section-component": SectionComponent,
  },
};
