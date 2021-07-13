export const groupByLayer = features => {
    const results = {}
    features.forEach(feature => {
      const {
        layer: { id },
      } = feature
      if (!results[id]) {
        results[id] = []
      }
      results[id].push(feature)
    })
  
    return results
}