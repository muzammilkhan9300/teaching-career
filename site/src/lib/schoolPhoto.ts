const replacedSchoolPhotos: Record<string, string> = {
  '/assets/images/School2.jpg': '/assets/images/School1.jpg',
  '/assets/images/school-placeholder-1.jpg': '/assets/images/School6.jpg',
  '/assets/images/school-placeholder-2.jpg': '/assets/images/School3.jpg',
  '/assets/images/school-placeholder-3.jpg': '/assets/images/School.jpg',
}

export function getSchoolPhoto(photo: string) {
  return replacedSchoolPhotos[photo] ?? photo
}
