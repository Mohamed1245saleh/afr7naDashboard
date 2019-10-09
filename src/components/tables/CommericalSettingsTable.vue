<template>
<div class="elevation-2">
  <vuetify-alert @message="alert.message = ''" :message="alert.message" />
  
    <v-dialog v-if="selectedItem" v-model="watchersDialog" max-width="500px" persistent >
      <v-card>
        <v-card-title>
          <p display-3>
          تعديل المشاهدات
          </p>
        </v-card-title>
        <v-card-text>
          <v-text-field
            name="watchers"
            label="المشاهدات"
            v-model="selectedItem.views"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" flat @click.native="watchersDialog = false">اغلاق
            <v-icon>ok</v-icon>
          </v-btn>
          <v-btn color="red darken-4" :loading="updatingWatchers" flat @click.native="updateWatchers">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


     <!-- like dialog -->
    <v-dialog v-model="likeDialog"  max-width="500px" persistent >
      <v-card>
        <v-card-title>
          <p display-3>
          تعديل الاعجبابات
          </p>
        </v-card-title>
        <v-card-text>
          <v-text-field
            name="likes"
            label="الاعجابات"
            v-model="likeCount"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="black darken-1" flat @click.native="likeDialog = false">اغلاق
            <v-icon>ok</v-icon>
          </v-btn>
          <v-btn color="red darken-4" :loading="updatingLikes" flat @click.native="editLikeCount">حفظ</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
        <v-select style="max-width:150px;height:32px" v-model="filterType" flat dense :items="[{text:'نوع الاعلان', value:null},...types]" />
        <v-dialog v-model="dialog" max-width="650px" scrollable>
            <v-btn slot="activator" color="primary" dark class="mb-2" @click="edit = false"> <v-icon>add</v-icon> اضافة اعلان</v-btn>
            <v-card>
                <v-card-title>
                    <span class="headline">{{formTitle}}</span>
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
                              <v-text-field v-model="newAdvertise.name" label="*اسم المعلن " />
                        <v-layout wrap>
                              <v-flex sm6>
                              <v-text-field v-model="newAdvertise.phone"  label="*هاتف المعلن" />
                              </v-flex>
                              <v-flex sm6>
                              <v-text-field v-model="newAdvertise.email"  label="بريد المعلن" />
                              </v-flex>
                        </v-layout>
                        <v-layout wrap v-if="!newAdvertise.type||newAdvertise.type.length ==0">
                              <v-flex sm12>
                                <v-select
                                  :items="commericalCategories"
                                  v-model="newAdvertise.commerical_category_id"
                                  label="التصنيف"
                                  item-value="id"
                                  item-text="title_ar"
                                  clearable
                                ></v-select>
                              </v-flex>
                        </v-layout>
                              
                        <v-layout wrap>
                              <v-flex sm8>
                              <v-text-field v-model="newAdvertise.title"  label="ضع عنوان للاعلان" />
                              </v-flex>
                              <v-flex sm4  v-if="!newAdvertise.commerical_category_id">
                              <v-select clearable @click:clear="newAdvertise.type = []" :disabled="edit" multiple v-model="newAdvertise.type" label="*نوع الاعلان" :items="types" >
                              </v-select>
                              </v-flex>
                        </v-layout>
                        <v-layout wrap>
                              <v-flex sm8>
                              <v-text-field v-model="newAdvertise.website" label="*رابط الاعلان" />
                              </v-flex>
                              <v-flex sm4>
                              <v-select  v-model="newAdvertise.country_id" label="*الدولة" :items="countries" item-text="title_ar" item-value="country_id" ></v-select>
                              </v-flex>
                        </v-layout>
                              <v-btn @click="$refs.image_input.click()">
                                <v-icon>image</v-icon>
                                *الصورة الاساسية للاعلان
                              </v-btn>
                              <v-btn @click="$refs.images_input.click()">
                                <v-icon>image</v-icon>
                                اضافة صور للاعلان
                              </v-btn>
                              <input style="display:none" type="file" ref="image_input">
                              <input multiple style="display:none" type="file" ref="images_input">
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="close" >الغاء</v-btn>
                    <v-btn color="blue darken-1" flat @click.native="save" :loading="saving">حفظ</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
        <v-icon class="light-blue--text" large @click="notifyDialog = true;notification.advertise_id = props.item.advertise_id">
                    notifications_active
                </v-icon>
        <v-dialog
          v-model="communicateDialog"
          width="500"
        >

        <v-card>
          <v-card-title
            class="headline grey lighten-2"
            primary-title
          >
            بيانات الاتصال
          </v-card-title>

          <v-card-text>
            <h3 v-if="advertiser.name">
              الاسم
              <small>
                {{advertiser.name}}
              </small>
            </h3>
            <h3 v-if="advertiser.phone">
              الهاتف
              <small>
                {{advertiser.phone}}
              </small>
            </h3>
            <h3 v-if="advertiser.email">
              الايميل
              <small>
                {{advertiser.email}}
              </small>
            </h3>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="green"
              flat
              @click="communicateDialog = false"
            >
              اغلاق
            </v-btn>
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
            <td class="text-xs-right"  v-if="props.item.title">{{ props.item.title }}</td>
            <td class="text-xs-right" v-else>لا يوجد عنوان</td>

            <td class="text-xs-right" v-if="props.item">{{props.item.type  > 0 ? types[props.item.type-1].text : "--" }}</td>
            <td class="text-xs-right" v-else>لا يوجد قسم</td>
            <td class="text-xs-right text-no-wrap text-truncate" style="max-width:100px"  v-if="props.item.website">
              <a target="_blank" :href="'//'+props.item.website">
                {{ props.item.website }}
              </a>
            </td>
            <td class="text-xs-right" v-else>لا يوجد رابط</td>
            <td class="text-xs-right">
              <img @click="openDialogue(props.item)" style="cursor:pointer"  :src="$root.$data.baseURL +props.item.spec_image" alt="صورة الاعلان" title="صورة الاعلان" width="50px" height="50px">
            </td>
            <td class="text-xs-right"  v-if="props.item.views">{{ props.item.views }}</td>
            <td class="text-xs-right" v-else>لا يوجد عنوان</td>
             <td class="text-xs-right"  v-if="props.item.likes_count">{{ props.item.likes_count + props.item.like_count}}</td>
            <td class="text-xs-right" v-else>لا يوجد عنوان</td>
            <td class="justify-right layout px-0">
               <v-icon  class="mr-2 yellow--text text--darken-3"  @click="editLikes(props.item)">
                      thumb_up
                  </v-icon>
                  <v-icon  class="mr-2 green--text text--darken-3"  @click="editing(props.item)">
                      edit
                  </v-icon>
                  <v-icon v-if="props.item.status == 1" class="orange--text text--lighten-2"  :loading="disapprove" @click="forceDelete = false;deleteItem(props.item)">
                      pause_circle_outline
                  </v-icon>
                  <v-icon v-else class="teal--text"  :loading="disapprove"  @click="restoreItem(props.item)">
                      play_circle_outline
                  </v-icon>
                <v-icon class="indigo--text"   @click="communicateDialog = true;advertiser = props.item">
                    call
                </v-icon>
                <v-icon class="amber--text text--darken-3"  @click="notifyDialog = true;notification.advertise_id = props.item.advertise_id">
                    notifications_active
                </v-icon>
                <v-icon class="blue--text text--darken-3"  @click="watchers(props.item)">
                    remove_red_eye
                </v-icon>
                <v-icon class="red--text"  @click="forceDelete = true;deleteItem(props.item)">
                    delete
                </v-icon>
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
    <v-dialog
    v-if="media.length"
      v-model="mediaDialog"
      width="600"
    >
    <v-card>
      
          <v-carousel
            :circle="false"
            interval="600000"
            v-model="mediaCarouselIndex"
          >
          <v-carousel-item
              v-for="item in media"
              :key="item.id"
            >
        <v-btn :disabled="!item.media_id" color="red" dark small fab absolute left icon @click="deleteImage">
          <v-icon>delete</v-icon>
        </v-btn>
               <img :src="$root.$data.baseURL+item.image" alt="" srcset="" style="margin:0 auto; width:100%;height:100%">
            </v-carousel-item>
          </v-carousel>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="notifyDialog"
      width="500"
    >

      <v-card>
        <v-card-title
          class="headline blue lighten-5"
          primary-title
        >
        ارسال اشعار لجميع الاجهزة المتاحة
        </v-card-title>

        <v-card-text>
          <form @submit.prevent="notifyDevices">
            <v-text-field v-model="notification.title_ar" label="عنوان رسالة الاشعار" />
            <!-- <v-text-field v-model="notification.title_en" label="عنوان رسالة الاشعار بالانجليزية" /> -->
            <v-text-field v-model="notification.details_ar" label="نص رسالة الاشعار" />
            <!-- <v-text-field v-model="notification.details_en" label="نص رسالة الاشعار بالانجليزية" /> -->
            <v-btn type="submit">
              ارسال
            </v-btn>
          </form>
        </v-card-text>
      </v-card>
    </v-dialog>
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
    mediaCarouselIndex: null,
    newAdvertise:{
      id:null,
      name: null,
      phone: null,
      email: null,
      website: null,
      type: null,
      title: null,
      country_id:null,
      likes:null,
    },
    edit:false,
    dialog:false,
    optionsDialog:false,
    communicateDialog:false,
    notifyDialog:false,
    mediaDialog:false,
    deleteDialog:false,
    forceDelete:false,
    dateFormatted:null,
    date: null,
    requests:[],
    media:[],
    totalRequests:0,
    pagination: {},
    search: '',
    loading: false,
    saving: false,
    disapprove: false,
    advertise: null,
    advertiser: { 
      name:null,
      phone: null,
      email: null
    },
    filterType:null,
    headers: [
      {
        text: 'عنوان',
        align: 'right',
        sortable: false
      },
      {
        text: 'نوع الاعلان ',
        align: 'right',
        sortable: false
      },
      {
        text: 'رابط الاعلان ',
        align: 'right',
        sortable: false
      },
      {
        text: 'صور',
        align: 'right',
        sortable: false
      },
      {
        text: 'مشاهدات',
        align: 'right',
        sortable: false
      },
       {
        text: 'الاعجابات',
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
    types:[
      {
        text: 'بداية التطبيق',
        value: 1,
      },
      {
        text: 'الشرائح',
        value: 2
      },
      {
        text: 'بين الاقسام',
        value: 3
      },
      {
        text: 'فلاش',
        value: 4
      },
    ],
    countries: [],
    page:1,
    notification:{
      title_ar: null,
      // title_en: null,
      details_ar: null,
      // details_en: null,
      advertise_id: null
    },
    selectedItem:null,
    likeDialog:false,
    updatingLikes:false,
    likeCount:null,
    updatingWatchers:false,
    commericalCategories:[],
    index: null ,
    watchersDialog:false,
  }),

  computed: {
    pages () {
      if (this.pagination.rowsPerPage == null ||
        this.pagination.totalItems == null
      ) return 0
      return Math.ceil(this.pagination.totalItems / this.pagination.rowsPerPage)
    },
    formTitle () {
      return this.editedItem ? 'تعديل' : 'اضافة اعلان'
    }
  },

  watch: {
    notifyDialog (val) {
      val || (
        this.notification = {}
      );
    },
    dialog (val) {
      val || this.close()
    },
    pagination: {
      handler () {
        this.page = this.pagination.page
        if(!this.loading)
        this.getDataFromApi()
        .then(data => {
          this.requests = data.items
          this.totalRequests = data.total
        })
      },
      deep: true
    },
    filterType(val){
      this.getDataFromApi()
      .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    });
    } 
  },
  created () {
    this.fetchCountries();
    this.getCommericalCategories();
    this.fetch();
  },
  methods: {
    editLikes(item){
      this.likeDialog = true;
      this.likeCount=item.like_count
      this.selectedItem= Object.assign({} ,item)
    },
    editLikeCount(){
           this.updatingWatchers = true
      this.$http.put('/api/admin/update-product-advertise-like/' + this.selectedItem.advertise_id+'?page=' + this.page, {likes_count : this.likeCount})
      .then(res => {
         this.fetch();
          this.alert.message = 'تم بنجاح'
          this.alert.type = 'info'
        this.updatingLikes = false
        this.likeDialog = false
      })
      .catch(({response}) => {
        this.updatingLikes = false
        this.likeDialog = false
      })
    },
    fetch() {
    if(!this.loading)
    this.getDataFromApi()
    .then(data => {
      this.requests = data.items
      this.totalRequests = data.total
    })
    },
    getCommericalCategories() {
      this.$http.get(`api/admin/commerical-categories?noLimit=1`)
      .then( res => {
        this.commericalCategories = res.data.CommericalCategories;
      })
    },
    fetchCountries () {
      this.$http.get('api/countries')
      .then( (res) => {
        this.countries = res.data
      })
    },
    getDataFromApi (res = null) {
      if(!this.loading)
      return new Promise((resolve, reject) => {
        this.loading = true
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
          const endpoint = (this.search.replace(/\s/g, '').length>0)?'api/admin/ads/search/' + this.search + '?type='+this.filterType + '&country='+this.$ls.get('country_id')
          :'api/admin/ads?page=' + page+ '&type='+this.filterType + '&country='+this.$ls.get('country_id')
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
    openDialogue (item) {
      this.mediaDialog = true;
      this.media = [...item.media, {image:item.spec_image}]
      },
    selectImage () {
      document.getElementById('image_choose').click()
    },
    deleteItem (item) {
      this.disapprove = true
      const index = this.requests.indexOf(item)
      const msg = this.forceDelete ? 'هل تريد حذف الاعلان نهائيًا؟' : 'ايقاف الاعلان التجارى؟'
      const forceDelete = this.forceDelete == true ? 1:0
      if(confirm(msg)) {
        this.$http.delete('api/admin/ads/'+ item.advertise_id+ '?forceDelete='+ forceDelete+'&page=' + this.page)
        .then( res => {
           
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          if(this.forceDelete)
            this.requests.splice(index, 1)
          this.alert.message = forceDelete == 1 ? 'تم حذف الاعلان': 'تم إيقاف الاعلان'
          this.alert.type = 'info'
          this.deleteDialog = false 
          this.disapprove = false
          this.forceDelete = false
        })
      }
    },

    restoreItem (item) {
      this.approve = true
      const index = this.requests.indexOf(item)
      if(confirm('هل تود استناف الاعلان؟')) {
        this.$http.post('api/admin/ads/restore/'+ item.advertise_id+'?page=' + this.page)
        .then( res => {
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
          this.alert.message = 'تم استناف الاعلان!'
          this.alert.type = 'success'
          this.approve = false
        })
      }else{
        this.approve = false
      }
    },

    close () {
      this.dialog = false
      this.errors = []
      this.newAdvertise = {
        id:null,
        name: null,
        phone: null,
        email: null,
        website: null,
        commerical_category_id: null,
        type: null,
        likes:null,
      }
      setTimeout(() => {
        this.editedItem = -1
      }, 300)
    },
    editing(item) {
      this.dialog = !this.dialog;
      this.edit=true;
      this.index = this.requests.indexOf(item)
      this.newAdvertise = Object.assign({}, item)

    },
    save () {
      this.saving = true
      let image =this.$refs.image_input.files[0]
      let images =this.$refs.images_input.files
      if(typeof image == 'undefined')
        image = null
      if(typeof images == 'undefined')
        images = null
      let formdata = new FormData();
      if(image)
      formdata.append('spec_image', image)
      for(let i = 0; i< images.length; i++){
        formdata.append('images[]', images[i])
      }
      if(this.newAdvertise.name)
      formdata.append('name', this.newAdvertise.name)
      if(this.newAdvertise.phone)
      formdata.append('phone', this.newAdvertise.phone)
      if(this.newAdvertise.email)
      formdata.append('email', this.newAdvertise.email)
      if(this.newAdvertise.website)
      formdata.append('website', this.newAdvertise.website)
      if(this.newAdvertise.type)
      formdata.append('ad_type', this.newAdvertise.type)
      if(this.newAdvertise.country_id)
      formdata.append('country_id', this.newAdvertise.country_id)
      if(this.newAdvertise.commerical_category_id)
      formdata.append('commerical_category_id', this.newAdvertise.commerical_category_id)
      if(this.newAdvertise.title)
      formdata.append('title', this.newAdvertise.title)
       if(this.newAdvertise.likes)
      formdata.append('likes', this.newAdvertise.likes)

      if(this.edit){
        this.$http.post('api/admin/ads/'+this.newAdvertise.advertise_id+'?page=' + this.page, formdata)
          .then( res => {
             
            this.getDataFromApi(res)
            .then(data => {
              this.requests = data.items
              this.totalRequests = data.total
            });
            this.alert.type = 'warning'
            this.alert.message = 'تم تعديل الاعلان!'
            this.close()
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
          .finally(() => this.saving = false)
      }
      else{
        this.$http.post('api/admin/ads'+'?page=' + this.page, formdata)
          .then( res => {
             
            this.getDataFromApi(res)
            .then(data => {
              this.requests = data.items
              this.totalRequests = data.total
            });
            this.alert.type = 'warning'
            this.alert.message = 'تم اضافة الاعلان!'
            this.close()
          })
          .catch( ({response}) => {
            this.errors = response.data.errors
          })
          .finally(() => this.saving = false)
      }
    },
    deleteImage() {
      const image = this.media[this.mediaCarouselIndex]
      if(confirm('هل تريد حذف الصورة؟'))
        this.$http.delete('api/admin/medias/'+image.media_id+'?page=' + this.page)
        .then( (res) => {
          this.media.splice(this.mediaCarouselIndex, 1)
          this.mediaCarouselIndex = (this.mediaCarouselIndex==0)?1:0;
          this.getDataFromApi(res)
          .then(data => {
            this.requests = data.items
            this.totalRequests = data.total
          })
        })
    },
    notifyDevices(){
      this.$http.post('api/admin/notifications', this.notification)
      .then( res => {
         
        this.alert.message = 'تم ارسال الاشعار لجميع الاجهزة'
        this.alert.type = 'info'
      })
      .finally(()=> this.notifyDialog = false)
    },
    watchers(item) {
      this.selectedItem = Object.assign({} ,item);
      this.index = this.requests.indexOf(item);
      this.watchersDialog = true
    },
    updateWatchers(item) {
      this.updatingWatchers = true
      this.$http.put('/api/admin/update-product-advertise-view/' + this.selectedItem.advertise_id+'?page=' + this.page, {views : this.selectedItem.views})
      .then(res => {
        this.$set(this.requests, this.index, this.selectedItem)
        this.$set(this.requests, index, res.data.data[0])
          this.alert.message = 'تم بنجاح'
          this.alert.type = 'info'
        this.updatingWatchers = false
        this.watchersDialog = false
      })
      .catch(({response}) => {
        this.updatingWatchers = false
        this.watchersDialog = false
      })
    },
 }
}
</script>

<style scoped>
  ul{
    list-style: none;
  }
</style>
