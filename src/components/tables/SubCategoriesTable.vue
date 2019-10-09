<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
    <v-toolbar flat color="white">
        <v-toolbar-title class=""><v-icon medium>{{icon}}</v-icon> {{title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="search"
            label="بحث"
            single-line
            hide-details
        ></v-text-field>
        <div  style="max-width:150px;height:32px">

        <!-- <v-select placeholder="التصنيف"  v-model="sub_category_id" :items="[{title_ar:'التصنيفات', id:null},...sub_categories]" item-text="title_ar" item-value="id" ></v-select> -->
        </div>
        <v-dialog v-model="dialog" max-width="500px">
            <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon> تصنيف فرعى جديد</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">{{formTitle}}</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li class="red--text" v-for="error in errors" :key="error[0] + Math.random()">
                      <ul>
                        <li v-for="err in error" :key="err + Math.random()">
                          {{err}}
                        </li>
                      </ul>
                    </li>
                  </ul>
                </v-card-text>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex>
                              <v-text-field v-model="newCategory.title_ar" label=" اسم التصنيف بالعربية" />
                              <v-text-field v-model="newCategory.title_en"  label="اسم التصنيف بالانجليزية" />
                              <v-btn color="info" @click="$refs.image_input.click()">
                                <v-icon>image</v-icon>
                                صورة
                              </v-btn>
                              <input style="display:none" type="file" ref="image_input">
                              
                            </v-flex>
                        </v-layout>
                            <v-flex sm-4>
                              <v-select placeholder="القسم الرئيسى"  v-model="main_category_id" :items="main_categories" item-text="title_ar" item-value="category_id" @change="fetchSubMainCategories"></v-select>
                            </v-flex>
                            <v-flex sm-4>
                              <v-select placeholder="القسم الفرعى"  v-model="sub_main_category_id" :items="sub_main_categories" item-text="title_ar" item-value="rel_category_id" @change="fetchSubCategories"></v-select>
                            </v-flex>
                            <v-flex sm-4>
                              <v-select placeholder="التصنيف"  v-model="newCategory.sub_rel_category_id" :items="sub_categories" item-text="title_ar" item-value="id" ></v-select>
                            </v-flex>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close">الغاء</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save">حفظ</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-toolbar>
    <v-data-table
        :headers="headers"
        :items="requests"
        :total-items="totalRequests"
        :loading="loading"
        :search="search"
        hide-actions
        :pagination.sync="pagination">
        <template slot="items" slot-scope="props">
            <td class="text-xs-right"  v-if="props.item.title_ar">{{ props.item.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد </td>
            <td class="text-xs-right"  v-if="props.item.title_en">{{ props.item.title_en }}</td>
            <td class="text-xs-right" v-else>لا يوجد </td>
            <td class="text-xs-right">
              <img style="cursor:pointer"  :src="$root.$data.baseURL +props.item.image" alt="ايقونة " title="صورة " width="50px" height="50px">
            </td>
            <td class="text-xs-right" v-if="props.item.sub_rel_category">{{ props.item.sub_rel_category.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد </td>
            <td class="justify-right layout px-0">
                <v-btn small flat color="blue" @click="editing(props.item)"> 
                  تعديل
                  <v-icon  class="mr-2 blue--text" >
                      edit
                  </v-icon>
                </v-btn>
                <v-btn :loading="disapprove" small flat color="red" @click="deleteItem(props.item)">
                  مسح
                  <v-icon class="red--text"  >
                      clear
                  </v-icon>
                </v-btn>
            </td>
        </template>
        <v-alert slot="no-results" :value="true" color="error" icon="warning">
            لا يوجد نتائج للبحث "{{search}}"
        </v-alert>
        <template slot="pageText" slot-scope="props">
          الصفحات {{ props.pageStart }} - {{ props.pageStop }} من {{ props.itemsLength }}
        </template>
        <template slot="no-data">
          <v-alert :value="true" color="success" icon="warning" outline>
            لا يوجد اعلانات بهذا القسم
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="primary" v-model="pagination.page" :length="pages"></v-pagination>
    </div>
</div>
</template>

<script>
export default {
  props:{
    title:{
      default: '',
      type: String
    },
    icon:{
      default: '',
      type: String
    }
  },
  data: () => ({
    errors:[],
    newCategory:{
      id:null,
      title_ar: null,
      title_en: null,
      sub_rel_category_id: null,
      sub_rel_category: null
    },
    edit:false,
    dialog:false,
    optionsDialog:false,
    imagesdialog:false,
    menu1:false,
    dateFormatted:null,
    date: null,
    requests:[],
    media:[],
    totalRequests:0,
    pagination: {},
    search: '',
    loading: false,
    disapprove: false,
    headers: [
      {
        text: 'التصنيف الفرعى (عربى)',
        align: 'right',
        sortable: false
      },
      {
        text: 'التصنيف الفرعى (English)',
        align: 'right',
        sortable: false
      },
      {
        text: 'صورة',
        align: 'right',
        sortable: false
      },
      {
        text: 'التصنيف',
        align: 'right',
        sortable: false
      },
      {
        text: 'عمليات',
        align: 'right',
        value: 'actions',
        sortable: false
      }
    ],
    editedItem: null,
    alert: {
      message: '',
      type: 'success'
    },
    page:1,
    filterCategory:null,
    sub_categories: [],
    sub_category_id: null,
    sub_main_categories: [],
    sub_main_category_id: null,
    main_categories: [],
    main_category_id: null,
    index: null
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    },
    formTitle () {
      return this.edit? "تعديل" : "تصنيف جديد";
    }
  },

  watch: {
    dialog (val) {
      if(!val){
        this.newCategory = {
            id:null,
            title_ar: null,
            title_en: null,
            sub_rel_category_id: null,
            sub_rel_category: null
          }
          this.sub_category_id = null;
          this.sub_main_category_id = null;
      }
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
      },
      deep: true
    },
    filterCategory(val){
      this.getDataFromApi()
      .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    });
    },
  },
  created () {
    this.fetchMainCategories();
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
  },
  methods: {
    fetchSubCategories() {
      this.$http.get(`api/admin/categories/subrel/${this.sub_main_category_id}/get/all`)
      .then( (res) => {
        this.sub_categories = res.data
      })
    },
    fetchMainCategories() {
      this.sub_category_id = null;
      this.sub_main_category_id = null;
      this.$http.get('api/admin/categories/main/get/all')
      .then( (res) => {
        this.main_categories = res.data.data
      })
    },
    fetchSubMainCategories() {
      this.sub_category_id = null;
      this.$http.get(`api/admin/categories/sub/${this.main_category_id}/get/all`)
      .then( (res) => {
        this.sub_main_categories = res.data
      })
    },
    getDataFromApi (res = null) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination
        if(res != null){
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          this.loading = false
          resolve({
            items,
            total
          })
        }
        else {
          const endpoint = (this.search.replace(/\s/g, '').length>0)?'api/admin/subsubcategories/search/' + this.search + '?category='+this.filterCategory :'api/admin/subsubcategories?page=' + page + '&category='+this.filterCategory
        this.$http.get(endpoint)
        .then( (res) => {
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          this.loading = false
          resolve({
            items,
            total
          })
        })
      }
      })
    },
    selectImage () {
      document.getElementById('image_choose').click()
    },

    deleteItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من مسح القسم')) {

        this.$http.delete('api/admin/subsubcategories/'+ item.id)
        .then( res => {
          this.requests.splice(index, 1)
          this.alert.message = 'تم مسح القسم!'
          this.alert.type = 'info'
          this.disapprove = false
        })
      }else{
        this.disapprove = false
      }
    },

    close () {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = -1
      }, 300)
    },
    editing(item) {
      this.index =  this.requests.indexOf(item);
      this.newCategory.id = item.id

      this.newCategory.title_ar = item.title_ar;
      this.newCategory.title_en = item.title_en;
      this.newCategory.sub_rel_category_id = item.sub_rel_category_id;
      this.fetchMainCategories();
      this.main_category_id = item.sub_rel_category.sub_category.category_id;
      this.fetchSubMainCategories();
      this.sub_main_category_id = item.sub_rel_category.rel_category_id;
      this.dialog = !this.dialog;
      this.edit=true;
    },
    save () {
      let index = this.index;
      let image =this.$refs.image_input.files[0]
      if(typeof image == 'undefined')
        image = null
      let formdata = new FormData();
      if(image)
      formdata.append('image', image)
      if(this.newCategory.title_ar)
      formdata.append('title_ar', this.newCategory.title_ar)
      if(this.newCategory.title_en)
      formdata.append('title_en', this.newCategory.title_en)
       if(this.main_category_id)
      formdata.append('category_id', this.main_category_id)
       if(this.sub_main_category_id)
      formdata.append('sub_category_id', this.sub_main_category_id)
      if(this.newCategory.sub_rel_category_id)
      formdata.append('sub_rel_category_id', this.newCategory.sub_rel_category_id)

      if(this.edit){
        this.$http.post('api/admin/subsubcategories/'+ this.newCategory.id, formdata)
          .then( res => {
            this.$set(this.requests, index, res.data)
            this.alert.type = 'warning'
            this.alert.message = 'تم تعديل القسم!'
            this.close()
            this.errors = []
            this.newCategory = {
              id:null,
              title_ar: null,
              title_en: null,
              sub_rel_category_id: null,
              sub_rel_category: null
            }
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
      else{
        this.$http.post('api/admin/subsubcategories', formdata)
          .then( res => {
            this.requests.push(res.data)
            this.alert.type = 'info'
            this.alert.message = 'تم اضافة القسم!'
            this.close()
            this.errors = []
            this.newCategory = {
              id:null,
              title_ar: null,
              title_en: null,
              sub_rel_category_id: null,
              sub_rel_category: null
            }
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
    },
    parseDate (date) {
        if (!date) return null
        const [month, day, year] = date.split('/')
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }
  }
}
</script>

<style scoped>
  ul{
    list-style: none;
  }
</style>
