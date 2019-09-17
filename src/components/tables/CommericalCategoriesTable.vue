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
            <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon> تصنيف جديد</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">تصنيف جديد</span>
                </v-card-title>
                <v-card-text>
                  <ul>
                    <li class="red--text" v-for="(error, index) in errors" :key="index">
                      <ul>
                        <li v-for="(err, i) in error" :key="i">
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
            <td class="text-xs-right" v-else>--</td>
            <td class="text-xs-right"  v-if="props.item.title_en">{{ props.item.title_en }}</td>
            <td class="text-xs-right" v-else>--</td>
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
            لا يوجد اعلانات بهذا التصنيف
          </v-alert>
        </template>
    </v-data-table>
    <div class="text-xs-center pt-2">
      <v-pagination total-visible="6" color="blue" v-model="page" :length="pages"></v-pagination>
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
      category:{
        id: null,
        title: null,
      },
      rel_category: {
        id: null,
        title: null,
      }
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
    pagination: {rowsPerPage: 10},
    search: '',
    loading: false,
    disapprove: false,
    headers: [
      {
        text: 'التصنيف',
        align: 'right',
        value: 'userName',
        sortable: false
      },
      {
        text: 'التصنيف en',
        align: 'right',
        value: 'userName',
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
    index:null,
    filterCategory:null,
    categories: []
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    }
  },

  watch: {
    dialog (val) {
      if(!val){
        this.newCategory = {
      id:null,
      title_ar: null,
      title_en: null,
    }
      }
      val || this.close()
    },
    pagination: {
      handler () {
        if(!this.loading){
          this.page = this.pagination.page
          this.fetch();
        }
      },
      deep: true
    },
    page(val) {
      this.pagination.page = val;
      this.fetch();
    }
  },
  created () {
    this.fetch();
  },
  methods: {
    fetch(){
      this.getDataFromApi()
      .then(data => {
        this.requests = data.items
        this.totalRequests = data.total
      })
    },
    getDataFromApi (res = null) {
      this.loading = true
      return new Promise((resolve, reject) => {
        const { sortBy, descending, page, rowsPerPage } = this.pagination
        const endpoint = 'api/admin/commerical-categories?page=' + page;
          //(this.search.replace(/\s/g, '').length>0)?'api/admin/categories/search/' + this.search + '?category='+this.filterCategory :
        this.$http.get(endpoint)
        .then( (res) => {
          let items = res.data.CommericalCategories.data
          const total = res.data.CommericalCategories.total
          this.pagination.totalItems = res.data.CommericalCategories.total
          setTimeout(() => {
            this.loading = false
          }, 300);
          resolve({
            items,
            total
          })
        })
      });
    },
    deleteItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      if(confirm('هل انت متأكد من مسح التصنيف')) {

        this.$http.delete('api/admin/commerical-categories/'+ item.id)
        .then( res => {
          this.requests.splice(index, 1)
          this.alert.message = 'تم مسح التصنيف!'
          this.alert.type = 'info'
          this.disapprove = false
        })
      }else{
        this.disapprove = false
      }
    },

    close () {
      this.dialog = false
      this.errors = []
      this.newCategory = {
        id:null,
        title_ar: null,
        title_en: null,
      }
      setTimeout(() => {
        this.editedItem = -1
      }, 300)
    },
    editing(item) {
      this.dialog = !this.dialog;
      this.edit=true;
      this.index = this.requests.indexOf(item);
      this.newCategory = Object.assign({}, item);
    },
    save () {
      if(this.edit){
        this.$http.put('api/admin/commerical-categories/'+ this.newCategory.id, this.newCategory)
          .then( res => {
            this.$set(this.requests, this.index, this.newCategory)
            this.alert.type = 'warning'
            this.alert.message = 'تم تعديل التصنيف!'
            this.close()
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
      }
      else{
        this.$http.post('api/admin/commerical-categories', this.newCategory)
          .then( res => {
            this.requests.push(res.data.commericalCategory)
            this.alert.type = 'info'
            this.alert.message = 'تم اضافة التصنيف!'
            this.close()
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
