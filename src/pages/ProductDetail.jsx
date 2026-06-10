import { useParams } from 'react-router-dom'

export default function ProductDetail() {
  const { id } = useParams()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold">Produit #{id}</h1>
      <p className="text-muted-foreground mt-2">Détail produit — à implémenter.</p>
    </div>
  )
}
