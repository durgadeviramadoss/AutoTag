import AWS from 'aws-sdk';
const AUTOTAG_TAG_NAME = new Array(4);
const AUTOTAG_TAG_Value = new Array(4);
var userType = "";
var user = "";
var principal = "";
//const AUTOTAG_TAG_NAME = 'AutoTag_Creator';
const ROLE_PREFIX = 'arn:aws:iam::';
const ROLE_SUFFIX = ':role';
const DEFAULT_STACK_NAME = 'autotag';
const MASTER_ROLE_NAME = 'AutoTagMasterRole';
const MASTER_ROLE_PATH = '/gorillastack/autotag/master/';

class AutotagDefaultWorker {
  constructor(event, s3Region) {
    this.event = event;
    this.s3Region = s3Region;
  }

  /* tagResource
  ** method: tagResource
  **
  
  ** Do nothing
  */
  tagResource() {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        // Do nothing
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  }

  getRoleName() {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        let cloudFormation = new AWS.CloudFormation({ region: _this.s3Region });
        cloudFormation.describeStackResource({
          StackName: DEFAULT_STACK_NAME,
          LogicalResourceId: MASTER_ROLE_NAME
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data.StackResourceDetail.PhysicalResourceId);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  assumeRole(roleName) {
    let _this = this;
    return new Promise((resolve, reject) => {
      try {
        AWS.config.region = 'us-east-1';
        let sts = new AWS.STS();
        sts.assumeRole({
          RoleArn: ROLE_PREFIX + _this.event.recipientAccountId + ROLE_SUFFIX + MASTER_ROLE_PATH + roleName,
          RoleSessionName: 'AutoTag-' + (new Date()).getTime(),
          DurationSeconds: 900
        }, (err, data) => {
          if (err) {
            reject(err);
          } else {
            let credentials = {
              accessKeyId: data.Credentials.AccessKeyId,
              secretAccessKey: data.Credentials.SecretAccessKey,
              sessionToken: data.Credentials.SessionToken
            };
            resolve(credentials);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  dumpEventInfo() {
    console.log('Event Name: ' + this.event.eventName);
    console.log('Event Type: ' + this.event.eventType);
    console.log('Event Source: ' + this.event.eventSource);
    console.log('AWS Region: ' + this.event.awsRegion);
    console.log('---');
  }

  getAutotagPair() {
    return getTagPair();
  }
  getTagPair() {
	var i=0;
	//var AUTOTAG_TAG_NAME = new Array(4);
        AUTOTAG_TAG_NAME[0] = "PrincipalId";
        AUTOTAG_TAG_NAME[1] = "UserId";
        AUTOTAG_TAG_NAME[2] = "Account";
        AUTOTAG_TAG_NAME[3] = "Cost Center";
	//var AUTOTAG_TAG_Value = new Array(4);	
		userType = this.event.userIdentity.type;
		principal = this.event.userIdentity.principalId;
		if(userType == "IAMUser"){
			user = this.event.userIdentity.userName;
		}
		else{
			user = principal[1].split(':');
		}
		AUTOTAG_TAG_Value[0] = principal;
		AUTOTAG_TAG_Value[1] = user;
		AUTOTAG_TAG_Value[2] = "Dev";
		AUTOTAG_TAG_Value[3] = 9035;		
		var tempArray1 = [];		
		AUTOTAG_TAG_NAME.map(function(d){
			var tempObject = {};
			tempObject[d] = AUTOTAG_TAG_Value[i];
			tempArray1.push(tempObject);
			i++;
		});
	
	 return tempArray1;	
	} 
};

export default AutotagDefaultWorker;


