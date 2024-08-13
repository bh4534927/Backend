const {Router} = require('express')
const CategoryRoutes = Router()
const {Index,getCategories,getCategoriesFromInstitutions} = require("../Controllers/CategoryController")
CategoryRoutes.get("/Categories",Index)
.post("/Post/Categories",getCategories)
.post("/GetCategories",getCategoriesFromInstitutions)


module.exports = CategoryRoutes