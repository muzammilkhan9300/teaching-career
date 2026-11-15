const candidatePhotos: Record<string, string> = {
  'candidate-muhammad-ali.jpg': '/assets/images/candidate-muhammad-ali.jpg',
  'candidate-ayesha-khan.jpg': '/assets/images/candidate-ayesha-khan.jpg',
  'candidate-usman-tariq.jpg': '/assets/images/candidate-usman-tariq.jpg',
  'candidate-sana-fatima.jpg': '/assets/images/candidate-sana-fatima.jpg',
  'candidate-hina-noreen.jpg': '/assets/images/candidate-hina-noreen.jpg',
  'candidate-hamza-saeed.jpg': '/assets/images/candidate-hamza-saeed.jpg',
  'candidate-sarah-javed.jpg': '/assets/images/candidate-sarah-javed.jpg',
}

export function getCandidatePhoto(photo: string) {
  const filename = photo.split('/').pop()
  return filename ? candidatePhotos[filename] ?? photo : photo
}
