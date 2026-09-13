import React from 'react';
import { View, Image, StyleSheet, TextInput, ScrollView, Linking } from 'react-native';
import { T, Tap, Card } from './ui';
import { Icon } from './Icons';
import { colors, fonts } from './theme';
import { generatedAssets } from './generatedAssets';

export function Header({title,subtitle,back,action}) {return <View style={f.header}>{back&&<Tap label="Geri dön" onPress={back} style={f.iconButton}><View style={{transform:[{rotate:'180deg'}]}}><Icon name="arrow" size={22}/></View></Tap>}<View style={{flex:1}}><T bold style={f.title}>{title}</T>{subtitle&&<T style={f.meta}>{subtitle}</T>}</View>{action}</View>;}
export function Button({children,onPress,secondary,disabled,label}) {return <Tap label={label} onPress={onPress} disabled={disabled} accessibilityState={{disabled:!!disabled}} style={[f.button,secondary&&f.secondary,disabled&&{opacity:.45}]}><T bold style={{color:secondary?colors.ink:'white',fontSize:14,textAlign:'center'}}>{children}</T></Tap>;}
export function Field({label,value,onChangeText,hint,multiline,...props}) {return <View style={{gap:7}}><T bold style={{fontSize:13}}>{label}</T><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholderTextColor={colors.muted} maxLength={multiline?3000:100} multiline={multiline} style={[f.input,multiline&&{minHeight:100,textAlignVertical:'top'}]} {...props}/>{hint&&<T style={f.meta}>{hint}</T>}</View>;}
export function Chips({items,value,onChange}) {return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingVertical:4}} style={{flexGrow:0}}>{items.map(item=>{const id=typeof item==='string'?item:item.id;const label=typeof item==='string'?item:item.title;return <Tap key={id} label={label} onPress={()=>onChange(id)} accessibilityState={{selected:value===id}} style={[f.chip,value===id&&f.chipActive]}><T bold={value===id} style={{fontSize:13,color:value===id?'white':colors.ink}}>{label}</T></Tap>;})}</ScrollView>;}
export function Empty({title,text,action,onPress,icon='book'}) {return <Card style={{padding:24,alignItems:'center',gap:12,backgroundColor:'#FFFCF8',borderColor:'#E9DDE8'}}><View style={f.emptyIcon}><Icon name={icon} color={colors.purple} size={28}/></View><T style={{fontSize:10,letterSpacing:1.4,color:colors.purple,fontFamily:fonts.bold}}>MOMORA ADIMI</T><T bold style={{fontSize:19,textAlign:'center',lineHeight:25}}>{title}</T><T style={[f.body,{textAlign:'center',maxWidth:310}]}>{text}</T>{action&&<Button onPress={onPress}>{action}</Button>}</Card>;}
export function Hint({children,danger=false}) {return <View style={[f.hint,danger&&{backgroundColor:'#F9E8E8',borderLeftColor:'#AF5966'}]}><T style={[f.body,{fontSize:13}]}>{children}</T></View>;}
export function ErrorText({children}) {return children?<T accessibilityRole="alert" style={{color:'#A34157',lineHeight:21}}>{children}</T>:null;}
export function Art({name,size=64,style}) {return generatedAssets[name]?<Image source={generatedAssets[name]} style={[{width:size,height:size},style]} resizeMode="contain"/>:null;}
export function RowLink({title,subtitle,onPress,art,icon='chevron',trailing}) {return <Tap onPress={onPress} label={title} style={f.rowLink}>{art&&<Art name={art} size={52}/>}<View style={{flex:1,gap:4}}><T bold style={{fontSize:15}}>{title}</T>{subtitle&&<T style={f.meta}>{subtitle}</T>}</View>{trailing||<Icon name={icon} size={18} color={colors.purple}/>}</Tap>;}
export function SourceLink({source,onError}) {return source?<Tap label={`Kaynağı aç: ${source.title}`} onPress={()=>Linking.openURL(source.url).catch(()=>onError?.('Kaynak bağlantısı açılamadı.'))} style={{paddingVertical:12,minHeight:44}}><T style={{fontSize:12,color:'#705577',textDecorationLine:'underline'}}>{source.title} ↗</T></Tap>:null;}
export const f=StyleSheet.create({
  header:{flexDirection:'row',alignItems:'center',gap:8,paddingVertical:5},title:{fontSize:24,letterSpacing:-.5},meta:{fontSize:12,lineHeight:18,color:colors.muted},body:{fontSize:15,lineHeight:24,color:'#625A6B'},
  iconButton:{width:44,height:44,alignItems:'center',justifyContent:'center'},button:{backgroundColor:colors.purple,borderRadius:17,minHeight:48,padding:14,alignItems:'center',justifyContent:'center'},secondary:{backgroundColor:'#EEE6EF'},
  input:{fontFamily:fonts.regular,fontSize:15,color:colors.ink,borderWidth:1,borderColor:'#DED3DB',backgroundColor:'#FFFDFA',borderRadius:15,padding:14,minHeight:48},
  chip:{borderRadius:22,paddingHorizontal:16,paddingVertical:12,backgroundColor:'#EFE9EC',minHeight:44,justifyContent:'center'},chipActive:{backgroundColor:colors.purple},
  emptyIcon:{backgroundColor:colors.lavender,width:58,height:58,borderRadius:29,alignItems:'center',justifyContent:'center'},hint:{backgroundColor:'#EEE8F2',borderLeftWidth:3,borderLeftColor:'#B29ABB',borderRadius:12,padding:14},
  rowLink:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:13,borderBottomWidth:1,borderColor:colors.line,minHeight:66},
  label:{fontSize:11,letterSpacing:1.5,color:colors.purple},row:{flexDirection:'row',alignItems:'center',gap:12},
});
