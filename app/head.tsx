export default function Head() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    url: "https://www.facuguardia.dev",
    name: "Vibe Learning",
    description: "Sistema de Gestión de Aprendizaje moderno y eficiente",
    publisher: {
      "@type": "Person",
      name: "Facu Guardia",
      url: "https://www.facuguardia.dev",
    },
  }

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Facu Guardia",
    url: "https://www.facuguardia.dev",
    jobTitle: "Senior Front-End Developer",
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
    </>
  )
}
