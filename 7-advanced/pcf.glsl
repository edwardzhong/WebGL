// Common.frag  
  
#ifdef GL_ES  
precision highp float;  
#endif  
const float c_NoShadow      = 0.0;  
const float c_SimpleShadow  = 1.0;  
const float c_SimpleShadowDynamicBias = 2.0;  
const float c_PCFShadow     = 3.0;  
  
const float c_NoLight       = 0.0;  
const float c_SimpleLight   = 1.0;  
  
uniform sampler2D texture;  
uniform sampler2D shadowTexture;  
  
uniform vec3 lightPosition;  
uniform mat4 viewMatrix;  
uniform float lightType;  
uniform float shadowType;  
  
// PCF专用  
uniform float pixelOffsetX;  
uniform float pixelOffsetY;  
  
varying vec4 viewSpacePosition;  
varying vec4 lightProjectedPosition;  
varying vec2 v_texCoord;  
varying vec3 v_normal;  
  
float unpack (vec4 colour)  
{  
    const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),  
                                1.0 / (256.0 * 256.0),  
                                1.0 / 256.0,  
                                1);  
    return dot(colour , bitShifts);  
}  
  
float simpleShadow( float bias )  
{  
    vec4 shadowMapPosition = lightProjectedPosition / lightProjectedPosition.w;  
    shadowMapPosition = ( shadowMapPosition + 1.0 ) / 2.0;  
  
    vec4 packedZValue = texture2DProj( shadowTexture, shadowMapPosition );  
  
    float distanceFromLight = unpack( packedZValue );  
    float shadowZ = unpack( packedZValue );  
  
    return float( shadowZ > shadowMapPosition.z - bias );  
}  
  
float calcBias( )  
{  
    float bias;  
  
    vec3 n = normalize( v_normal );  
    // Direction of the light (from the fragment to the light)  
    vec3 l = normalize( lightPosition );  
  
    // Cosine of the angle between the normal and the light direction,  
    // clamped above 0  
    //  - light is at the vertical of the triangle -> 1  
    //  - light is perpendiular to the triangle -> 0  
    //  - light is behind the triangle -> 0  
    float cosTheta = clamp( dot( n, l ), 0.0, 1.0 );  
  
    bias = 0.0001 * tan( acos( cosTheta ) );  
    bias = clamp( bias, 0.0, 0.01 );  
  
    return bias;  
}  
  
float lookup( vec2 offSet, float bias )  
{  
    vec4 shadowMapPosition = lightProjectedPosition / lightProjectedPosition.w;  
    shadowMapPosition = ( shadowMapPosition + 1.0 ) / 2.0;  
  
    vec4 coordOffset = vec4( offSet.x * pixelOffsetX, offSet.y * pixelOffsetY, 0.05, 0.0 );  
    vec4 packedZValue = texture2DProj( shadowTexture, shadowMapPosition + coordOffset );  
    float distanceFromLight = unpack( packedZValue );  
    float shadowZ = unpack( packedZValue );  
    return float( shadowZ > shadowMapPosition.z - bias );  
}  
  
float PCFShadow( float bias )// PCF阴影  
{  
    float shadow = 0.0;  
  
    for ( float y = -1.5; y <= 1.5; y = y + 1.0 )  
    {  
        for ( float x = -1.5; x <= 1.5; x = x + 1.0 )  
        {  
            shadow += lookup( vec2( x, y ), bias );  
        }  
    }  
  
    shadow /= 16.0;  
    return shadow;  
}  
  
void main( )  
{  
    // 计算纹理  
    vec4 textureColor = texture2D( texture, v_texCoord );  
  
    // 计算光照  
    vec4 lightColor = vec4( 1.0 );  
    if ( lightType <= c_NoLight )  
    {  
        // 没有光照，没有任何操作  
    }  
    else if ( lightType <= c_SimpleLight )  
    {  
        vec4 viewSpaceLightPosition = viewMatrix * vec4( lightPosition, 1.0 );  
        vec4 lightVector = viewSpaceLightPosition - viewSpacePosition;  
        lightVector = normalize( lightVector );  
        float NdotL = dot( v_normal, vec3( lightVector ) );  
  
        float diffuse = max( 0.0, NdotL );  
        float ambient = 0.3;  
        lightColor = vec4( ambient + diffuse );  
    }  
  
    // 计算阴影  
    float shadow = 1.0;  
    if ( shadowType <= c_NoShadow )  
    {  
        // 没有阴影  
    }  
    else  
    {  
        if ( lightProjectedPosition.w > 0.0 )  
        {  
            if ( shadowType <= c_SimpleShadow )  
            {  
                shadow = simpleShadow( 0.0005 );  
            }  
            else if ( shadowType <= c_SimpleShadowDynamicBias )  
            {  
                shadow = simpleShadow( calcBias( ) );  
            }  
            else if ( shadowType <= c_PCFShadow )  
            {  
                shadow = PCFShadow( calcBias( ) );  
            }  
            shadow = shadow * 0.8 + 0.2;  
        }  
    }  
    gl_FragColor = textureColor * lightColor * shadow;  
}  