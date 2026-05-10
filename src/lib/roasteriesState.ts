let savedView: 'list' | 'map' = 'list'

export const getRoasteriesView = () => savedView
export const setRoasteriesView = (v: 'list' | 'map') => {
  savedView = v
}
