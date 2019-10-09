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
        <v-dialog v-model="dialog" max-width="500px">
            <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon> إضافة </v-btn>
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
                              <v-text-field v-model="newCategory.title_ar" label=" اسم القسم رئيسى بالعربية" />
                              <v-text-field v-model="newCategory.title_en"  label="اسم القسم رئيسى بالانجليزية" />
                              <v-select v-model="newCategory.titleId" flat dense :items="[{title_ar:'عنوان الاقسام', id:null},...titles]" item-text="title_ar" item-value="id" />

                              <v-btn color="info" @click="$refs.image_input.click()">
                                <v-icon>image</v-icon>
                                صورة
                              </v-btn>
                              <input style="display:none" type="file" ref="image_input">
                            </v-flex>
                        </v-layout>
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
            <td class="text-xs-right" v-else>لا يوجد مسمى</td>
            <td class="text-xs-right"  v-if="props.item.title_en">{{ props.item.title_en }}</td>
            <td class="text-xs-right" v-else>لا يوجد مسمى</td>
            <td class="text-xs-right"  v-if="props.item.title">{{ props.item.title.title_ar }}</td>
            <td class="text-xs-right" v-else>لا يوجد </td>
            <td class="text-xs-right">
              <img v-if="props.item.image" style="cursor:pointer"  :src="$root.$data.baseURL+props.item.image" alt="صورة الاعلان" title="صورة الاعلان" width="50px" height="50px">
              <v-icon v-else>
                image
              </v-icon>
            </td>
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
      titleId: null
    },
    edit:false,
    dialog:false,
    imagesdialog:false,
    requests:[],
    totalRequests:0,
    pagination: {},
    search: '',
    loading: false,
    disapprove: false,
    headers: [
      {
        text: 'الاسم بالعربية',
        align: 'right',
        sortable: false
      },
      {
        text: 'الاسم بالانجليزية',
        align: 'right',
        sortable: false
      },
      {
        text: 'عنوان الاقسام',
        align: 'right',
        sortable: false
      },
      {
        text: 'صورة',
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
    alert: {
      message: '',
      type: 'success'
    },
    page:1,
    titles: []
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    },
    formTitle (){
      return (this.edit)? 'تعديل' : 'اضافة'
    }
  },

  watch: {
    dialog (val) {
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        if(!this.loading) {

          this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
        }
      },
      deep: true
    }
  },
  created () {
    this.fetch();
  },
  methods: {
    fetch(){
      this.fetchTitles();
      if(!this.loading)
      this.getDataFromApi()
      .then(data => {
        this.requests = data.items
        this.totalRequests = data.total
      })
    },
    fetchTitles(){
      this.$http.get('api/admin/titles?filter=all')
      .then( res => {
        this.titles = res.data
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
          setTimeout(() => {
            this.loading = false
          }, 300);
          resolve({
            items,
            total
          })
        }
        else {
          const endpoint = (this.search.replace(/\s/g, '').length>0)?'api/admin/maincategories/search/' + this.search :'api/admin/maincategories?page=' + page
        this.$http.get(endpoint)
        .then( (res) => {
          let items = res.data.data
          const total = res.data.total
          this.pagination.rowsPerPage = res.data.per_page
          this.pagination.totalItems = res.data.total
          setTimeout(() => {
            this.loading = false
          }, 300);
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
      if(confirm('هل انت متأكد من مسح الاعلان')) {

        this.$http.delete('api/admin/maincategories/'+ item.category_id+'?page=' + this.page)
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
        this.edit = false
        this.newCategory = {
          id:null,
          title_ar: null,
          title_en: null,
          titleId: null
        }
      }, 300)
    },
    editing(item) {
      this.dialog = !this.dialog;
      this.edit=true;

      this.newCategory.id = item.category_id

      this.newCategory.title_ar = item.title_ar;
      this.newCategory.title_en = item.title_en;
      this.newCategory.titleId = item.main_category_id;

      this.index = this.requests.indexOf(item)
    },
    save () {
      const index = this.index

      let image =this.$refs.image_input.files[0]
      if(typeof image == 'undefined')
        image = null
      let formdata = new FormData();
      if(image)
      formdata.append('image', image)
      if(this.newCategory.title_ar)
      formdata.append('main_category_title_ar', this.newCategory.title_ar)
      if(this.newCategory.title_en)
      formdata.append('main_category_title_en', this.newCategory.title_en)
      if(this.newCategory.titleId)
      formdata.append('main_category_id', this.newCategory.titleId)

      if(this.edit){
        this.$http.post('api/admin/maincategories/'+ this.newCategory.id+'?page=' + this.page, formdata)
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
              titleId: null
            }
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
      else{
        this.$http.post('api/admin/maincategories'+'?page=' + this.page, formdata)
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
              titleId: null
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
