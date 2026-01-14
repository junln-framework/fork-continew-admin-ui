/** 用户类型 */
export interface UserResp {
  id: string
  username: string
  nickname: string
  avatar: string
  gender: number
  email: string
  phone: string
  description: string
  status: 1 | 2
  isSystem?: boolean
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
  deptId: number
  deptIds: Array<number>
  deptNames: Array<string>
  roleIds: Array<number>
  roleNames: Array<string>
  disabled: boolean
}
export type UserDetailResp = UserResp & {
  pwdResetTime?: string
}
export interface UserImportResp {
  importKey: string
  totalRows: number
  validRows: number
  duplicateUserRows: number
  duplicateEmailRows: number
  duplicatePhoneRows: number
}
export interface UserQuery {
  description?: string
  status?: number
  createTime?: Array<string>
  deptId?: string
  sort: Array<string>
  userIds?: Array<string>
  roleId?: string
}
export interface UserPageQuery extends UserQuery, PageQuery {}

/** 角色类型 */
export interface RoleResp {
  id: string
  name: string
  code: string
  sort: number
  description: string
  dataScope: number
  isSystem: boolean
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
  disabled: boolean
}
export type RoleDetailResp = RoleResp & {
  menuIds: Array<number>
  deptIds: Array<number>
  menuCheckStrictly: boolean
  deptCheckStrictly: boolean
}
export interface RolePermissionResp {
  id: string
  title: string
  parentId: string
  permission?: string
  children?: RolePermissionResp[]
  permissions?: RolePermissionResp[]
  isChecked?: boolean
}
export interface RoleUserResp {
  id: string
  username: string
  nickname: string
  gender: number
  description: string
  status: 1 | 2
  isSystem?: boolean
  deptId: string
  deptName: string
  roleIds: Array<number>
  roleNames: Array<string>
  disabled: boolean
}
export interface RoleQuery {
  description?: string
  sort: Array<string>
}
export interface RoleUserQuery {
  description?: string
  sort: Array<string>
}
export interface RoleUserPageQuery extends RoleUserQuery, PageQuery {}

/** 菜单类型 */
export interface MenuResp {
  id: string
  title: string
  parentId: string
  type: 1 | 2 | 3
  path: string
  name: string
  component: string
  redirect: string
  icon: string
  isExternal: boolean
  isCache: boolean
  isHidden: boolean
  permission: string
  sort: number
  status: 1 | 2
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
  children: MenuResp[]
}
export interface MenuQuery {
  title?: string
  status?: number
}

/** 部门类型 */
export interface DeptResp {
  id: string
  name: string
  sort: number
  status: 1 | 2
  isSystem: boolean
  description: string
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
  parentId: string
  children: DeptResp[]
}
export interface DeptQuery {
  description?: string
  status?: number
}

export interface AreaLevelCodes {
  countryCode: string // 国家/省级编码
  provinceCode: string // 省/直辖市级编码
  cityCode: string // 市级编码
  districtCode: string // 区县级编码
}

/** 区域类型 */
export interface AreaResp {
  id: string
  areaCode: string
  areaName: string
  shortName: string
  parentCode: string
  level: number
  fullNamePath: string
  fullCodePath: string
  isActive: number
  zipCode: string
  createTime: string
  children: AreaResp[]
}
export interface AreaQuery {
  parentCode: string
  level?: number
}

export interface AreaNode {
  code: string // 区域编码（唯一标识）
  name: string // 区域名称
  level: 0 | 1 | 2 | 3 // 层级：0-国家，1-省，2-市，3-区
  parentCode?: string // 父级编码
  children?: AreaNode[] // 子节点
  isLeaf?: boolean // 是否为叶子节点（区级）
}

export interface AreaFormData {
  countryCode: string // 国家编码
  provinceCode: string // 省份编码
  cityCode: string // 城市编码
  districtCode: string // 区县编码

  countryName: string // 国家名称
  provinceName: string // 省份名称
  cityName: string // 城市名称
  districtName: string // 区县名称
}

/** 字典类型 */
export interface DictResp {
  id: string
  name: string
  code: string
  isSystem: boolean
  description: string
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
}
export interface DictQuery {
  description?: string
  sort: Array<string>
}
export interface DictItemResp {
  id: string
  label: string
  value: string
  color: string
  sort: number
  description: string
  status: 1 | 2
  dictId: number
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
}
export interface DictItemQuery {
  description?: string
  status?: number
  sort: Array<string>
  dictId: string
}
export interface DictItemPageQuery extends DictItemQuery, PageQuery {
}

/** 公告类型 */
export interface NoticeResp {
  id?: string
  title?: string
  type: string
  noticeScope: number
  noticeMethods?: Array<number>
  isTiming: boolean
  publishTime?: string
  isTop: boolean
  status?: number
}
export type NoticeDetailResp = NoticeResp & {
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
}
export type NoticePreviewResp = NoticeDetailResp & {
  content: string
}
export interface NoticeQuery {
  title?: string
  type?: string
  sort: Array<string>
}
export interface NoticePageQuery extends NoticeQuery, PageQuery {
}

/** 文件类型 */
export interface FileItem {
  id: string
  name: string
  originalName: string
  size: number
  url: string
  parentPath: string
  path: string
  sha256: string
  contentType: string
  metadata: string
  thumbnailSize: number
  thumbnailName: string
  thumbnailMetadata: string
  thumbnailUrl: string
  extension: string
  type: number
  storageId: string
  storageName: string
  createUserString: string
  createTime: string
  updateUserString?: string
  updateTime?: string
}
/** 文件资源统计信息 */
export interface FileStatisticsResp {
  type: string
  size: any
  number: number
  unit: string
  data: Array<FileStatisticsResp>
}
/** 文件夹计算大小信息 */
export interface FileDirCalcSizeResp {
  size: number
}
export interface FileQuery {
  originalName?: string
  type?: string
  parentPath?: string
  sort: Array<string>
}
export interface FilePageQuery extends FileQuery, PageQuery {
}

/** 存储类型 */
export interface StorageResp {
  id: string
  name: string
  code: string
  type: number
  accessKey: string
  secretKey: string
  endpoint: string
  bucketName: string
  domain: string
  recycleBinEnabled: boolean
  recycleBinPath: string
  description: string
  isDefault: boolean
  sort: number
  status: number
  createUserString: string
  createTime: string
  updateUserString: string
  updateTime: string
}
export interface StorageQuery {
  description?: string
  type?: number
  sort: Array<string>
}

/** 客户端类型 */
export interface ClientResp {
  id: string
  clientId: string
  clientType: string
  authType: string
  activeTimeout: string
  timeout: string
  status: string
  isConcurrent: boolean
  replacedRange: string
  maxLoginCount: number
  overflowLogoutMode: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface ClientDetailResp {
  id: string
  clientId: string
  clientType: string
  authType: string
  activeTimeout: string
  timeout: string
  status: number
  isConcurrent: boolean
  maxLoginCount: number
  replacedRange: string
  overflowLogoutMode: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface ClientQuery {
  clientType: string
  authType: string[]
  status: string
  sort: Array<string>
}
export interface ClientPageQuery extends ClientQuery, PageQuery {}

/** 系统参数类型 */
export interface OptionResp {
  id: string
  name: string
  code: string
  value: string
  description: string
}

export interface OptionQuery {
  code?: Array<string>
  category?: string
}

/** 基础配置类型 */
export interface BasicConfig {
  SITE_FAVICON: string
  SITE_LOGO: string
  SITE_TITLE: string
  SITE_COPYRIGHT: string
  SITE_BEIAN: string
}

/** 基础配置类型 */
export interface SiteConfig {
  SITE_FAVICON: OptionResp
  SITE_LOGO: OptionResp
  SITE_TITLE: OptionResp
  SITE_DESCRIPTION: OptionResp
  SITE_COPYRIGHT: OptionResp
  SITE_BEIAN: OptionResp
}

/** 安全配置类型 */
export interface SecurityConfig {
  PASSWORD_ERROR_LOCK_COUNT: OptionResp
  PASSWORD_ERROR_LOCK_MINUTES: OptionResp
  PASSWORD_EXPIRATION_DAYS: OptionResp
  PASSWORD_EXPIRATION_WARNING_DAYS: OptionResp
  PASSWORD_REPETITION_TIMES: OptionResp
  PASSWORD_MIN_LENGTH: OptionResp
  PASSWORD_ALLOW_CONTAIN_USERNAME: OptionResp
  PASSWORD_REQUIRE_SYMBOLS: OptionResp
}

/** 邮箱配置类型 */
export interface MailConfig {
  MAIL_PROTOCOL: OptionResp
  MAIL_HOST: OptionResp
  MAIL_PORT: OptionResp
  MAIL_USERNAME: OptionResp
  MAIL_PASSWORD: OptionResp
  MAIL_SSL_ENABLED: OptionResp
  MAIL_SSL_PORT: OptionResp
}

/** 登录配置类型 */
export interface LoginConfig {
  LOGIN_CAPTCHA_ENABLED: OptionResp
}

/** 短信配置类型 */
export interface SmsConfigResp {
  id: string
  name: string
  supplier: string
  accessKey: string
  secretKey: string
  signature: string
  templateId: string
  weight: string
  retryInterval: string
  maxRetries: string
  maximum: string
  supplierConfig: string
  status: number
  isDefault: boolean
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
  disabled: boolean
}
export interface SmsConfigQuery {
  name: string | undefined
  supplier: string | undefined
  accessKey: string | undefined
  sort: Array<string>
}
export interface SmsConfigPageQuery extends SmsConfigQuery, PageQuery {}

/** 短信日志类型 */
export interface SmsLogResp {
  id: string
  configId: string
  phone: string
  params: string
  status: number
  resMsg: string
  createUser: string
  createTime: string
  updateUser: string
  updateTime: string
  createUserString: string
  updateUserString: string
}
export interface SmsLogQuery {
  configId: string | undefined
  phone: string | undefined
  status: number | undefined
  sort: Array<string>
}
export interface SmsLogPageQuery extends SmsLogQuery, PageQuery {}

/** 绑定三方账号信息 */
export interface BindSocialAccountRes {
  source: string
  description: string
}

/** 系统消息类型 */
export interface MessageResp {
  id: string
  title: string
  content: string
  type: number
  path: string
  isRead: boolean
  readTime?: string
  createUserString?: string
  createTime: string
}

export interface MessageQuery {
  title?: string
  type?: number
  isRead?: boolean
  sort: Array<string>
}

export interface MessagePageQuery extends MessageQuery, PageQuery {
}

/** 分片上传 - 初始化参数 */
export interface MultiPartUploadInitReq {
  fileName: string
  fileSize: number
  fileMd5: string
  parentPath: string
  metaData: Record<string, string>
}

/** 分片上传 - 初始化响应 */
export interface MultiPartUploadInitResp {
  uploadId: string
  partSize: number
  path: string
  uploadedPartNumbers: number[]
}

/** 分片上传 - 上传分片参数 */
export interface UploadPartReq {
  uploadId: string
  partNumber: number
  file: Blob
  path: string
}

/** 分片上传 - 上传分片响应 */
export interface UploadPartResp {
  /** 分片编号 */
  partNumber: number
  /** 分片ETag */
  partETag: string
  /** 分片大小 */
  partSize: number
  /** 是否成功 */
  success: boolean
  /** 错误信息 */
  errorMessage?: string
}

/** 分片上传 - 完成上传参数 */
export interface CompleteMultipartUploadReq {
  uploadId: string
  partETags: Array<{
    partNumber: number
    eTag: string
  }>
}

/** 分片上传 - 取消上传参数 */
export interface CancelUploadParams {
  uploadId: string
}
