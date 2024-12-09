export const isHomePage = (path:string) => {
	return path == "/"
}

export const isFilmPage = (path:string) => {
    return path.match(/^\/films\/(\d+)/)
}